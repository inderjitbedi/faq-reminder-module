const router = require("express").Router();
const jwt = require("jsonwebtoken");
const BillCategory = require("../models/BillCategoryModel");
const PaymentMethod = require("../models/PaymentMethodModel");
const Bill = require("../models/BillModel");
const moment = require('moment');
const BillOccurrence = require("../models/BillOccurrenceModel");
const PaymentMethodModel = require("../models/PaymentMethodModel");
const BillCategoryModel = require("../models/BillCategoryModel");
const _ = require('lodash')
const cron = require('node-cron');


function validateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    if (token == null) res.status(401).send({
        statusCode: 401,
        message: "Unauthorized"
    });
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            res.status(401).send({
                statusCode: 401,
                message: "Unauthorized"
            });
        } else {
            req.user = user
            next()
        }
    })
}
// createOccurrences
router.get("/createOccurrences",validateToken, async (req, res) => {
    const bills = await getBills()
    bills.forEach(bill => {
        createOccurrence(bill);
    })
    if (!bills) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find Bills"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...bills]
    })
})
// get bills
router.get("/bills", validateToken, async (req, res) => {
    const bills = await getBills()
    if (!bills) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find Bills"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...bills]
    })
})

router.put("/delete-bill", validateToken, async (req, res) => {
    var bill = await Bill.findOneAndUpdate({ _id: req.body._id }, { isDeleted: true, updatedAt: new Date() });
    var occurrences = await BillOccurrence.updateMany({ billId: req.body._id }, { isDeleted: true, updatedAt: new Date() })
    if (!bill) return res.status(400).send({
        statusCode: 400,
        message: "Unable to delete Bill"
    });
    else return res.status(200).send({
        statusCode: 200,
        message: "Bill and it's occurrences deleted successfully",
    })
})

// get bills-categories
router.get("/bill-categories", validateToken, async (req, res) => {
    const billCategories = await BillCategory.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!billCategories) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find Bill Categories"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...billCategories]
    })
})

router.get("/check-uniqueness-bill-category/:name", validateToken, async (req, res) => {
    const categoryExist = await BillCategory.find({ name: req.params.name, isDeleted: false });
    return res.status(200).send({
        statusCode: 400,
        isUnique: categoryExist.length ? false : true
    });
})
// get bills-categories
router.get("/payment-methods", validateToken, async (req, res) => {
    const paymentMethods = await PaymentMethod.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!paymentMethods) return res.status(200).send({
        statusCode: 200,
        response: [],
        message: "Unable to find Payment Methods"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...paymentMethods]
    })
})

router.get("/check-uniqueness-payment-method/:name", validateToken, async (req, res) => {
    const methodExist = await PaymentMethod.find({ name: req.params.name, isDeleted: false });
    return res.status(200).send({
        statusCode: 400,
        isUnique: methodExist.length ? false : true
    });
})

// create faq category
router.post("/create-bill", validateToken, async (req, res) => {
    let reqBody = req.body;
    if (reqBody.paymentMethodName && !reqBody.paymentMethodId) {
        var paymentMethod = await PaymentMethod.create({ name: reqBody.paymentMethodName });
        reqBody.paymentMethodId = paymentMethod._id
        delete reqBody.paymentMethodName
    }
    if (reqBody.billCategoryName && !reqBody.billCategoryId) {
        var billCategory = await BillCategory.create({ name: reqBody.billCategoryName });
        reqBody.billCategoryId = billCategory._id
        delete reqBody.billCategoryName
    }

    if (req.body._id) {
        var bill = await Bill.findOneAndUpdate({ _id: req.body._id }, { ...req.body, updatedAt: new Date() }, { returnDocument: 'after' });
        console.log("\n\n updated bill = ", bill);
        // update occurrences here
        var paidOccurrences = await BillOccurrence.find({
            billId: req.body._id,
            occurrenceDate: {
                $gte: moment().startOf('day').toISOString()
            },
            isPaid: true,
            isDeleted: false
        })
        console.log("\n\n paidOccurrences = ", paidOccurrences);
        // _.map(paidOccurrences, 'occurrenceDate')
        var occurrences = await BillOccurrence.updateMany({
            billId: req.body._id,
            occurrenceDate: {
                $gte: moment().startOf('day').toISOString()
            },
            isPaid: false,
        }, { isDeleted: true, updatedAt: new Date() })
        console.log("occurrences", occurrences)
        createOccurrence(bill, _.map(paidOccurrences, 'occurrenceDate'));
    } else {
        var bill = await Bill.create(req.body);
        console.log("\n\n created bill = ", bill);
        createOccurrence(bill)
    }

    if (!bill) return res.status(400).send({
        statusCode: 400,
        message: "Unable to create bill"
    });
    else if (req.body._id)
        return res.status(200).send({
            statusCode: 200,
            message: "Bill updated successfully.",
            response: { ...reqBody }
        })
    else return res.status(201).send({
        statusCode: 201,
        message: "Bill created successfully.",
        response: { ...bill._doc }
    })
})
router.put("/mark-as-paid", validateToken, async (req, res) => {
    var occurrence = await markOccurrenceAsPaid(req.body._id)
    if (!occurrence) return res.status(200).send({
        statusCode: 200,
        message: "Unable to make the bill occurrence as paid"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: true,
        message: "Bill occurrence marked as paid successfully."
    })

})
// get reminders
router.get("/list", validateToken, async (req, res) => {
    let reminders = {
        overdue: [],
        duesoon: [],
        upcoming: [],
        paid: []
    };

    let options = {
        isDeleted: false,
    }
    if (req.query.gte && req.query.lte) {
        options.occurrenceDate = {
            $gte: req.query.gte,
            $lte: req.query.lte,
        }
    }
    // console.log("BillOccurrence.find options = ", options)
    var occurrences = await getBillOccurrences(options);
    let amountDue = 0;
    let lastOccurrenceDate = moment().add(30, 'days')
    if (req.query.gte && req.query.lte) {
        lastOccurrenceDate = moment(req.query.lte)
    }
    // console.log("occurrences === ", occurrences)
    occurrences.forEach((occurrence, index) => {

        let billCycleDate = occurrence.occurrenceDate;

        if (occurrence.isPaid) {
            reminders.paid.push(occurrence)
        } else if (moment(billCycleDate).endOf('day') <= moment() && moment(billCycleDate) >= subtractDaysToDate(moment(), "30")) {
            // overdue
            amountDue += occurrence.billId.amount;
            reminders.overdue.push(occurrence)
        } else if (moment(billCycleDate).endOf('day') >= moment() && moment(billCycleDate) <= addDaysToDate(moment(), "15")) {
            // due soon
            amountDue += occurrence.billId.amount;
            reminders.duesoon.push(occurrence)
        } else if (moment(billCycleDate) >= addDaysToDate(moment(), "15") && moment(billCycleDate) <= lastOccurrenceDate) {
            // upcoming
            amountDue += occurrence.billId.amount;
            reminders.upcoming.push(occurrence)
        } else {
            // console.log("\n\nleft" + occurrence + "\n\n");
        }

    })

    if (!reminders) return res.status(200).send({
        statusCode: 200,
        response: { amountDue: 0, reminders: {} },
        message: "Unable to find reminders"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: { amountDue: amountDue, reminders: reminders }
    })
})


function addDaysToDate(date, daysToAdd) {
    if (daysToAdd < 30)
        return moment(date).add(daysToAdd, 'days')
    return moment(date).add(daysToAdd / 30, 'month')

}
function subtractDaysToDate(date, daysToSubtract) {
    return moment(date).subtract(daysToSubtract, 'days')
}

// create occurrences
async function createOccurrence(bill, ignoreDates = []) {
    let startDate = bill.startDate;
    let repeatsAfter = bill.repeatsAfter;
    // let endDate = bill.endDate;
    let billCycleDate = moment(startDate)
    // let lastCycleDate = subtractDaysToDate(moment(), repeatsAfter)
    // let next30Days = addDaysToDate(moment(), "30")
    let lastOfNextMonth = moment().add(1, 'month').endOf('month');

    let occurrence = {
        ...bill._doc,
        billId: bill._id,
        paymentMethodId: bill.paymentMethodId._id,
        billCategoryId: bill.billCategoryId._id,
        isPaid: false
    }
    delete occurrence._id
    delete occurrence.isDeleted
    delete occurrence.updatedAt
    delete occurrence.createdAt
    delete occurrence.__v


    if (repeatsAfter > 0) {
        console.log("\n\nEntered repeating occurrence block")

        while (billCycleDate <= lastOfNextMonth.endOf('day')) {
            console.log("billCycleDate = ", billCycleDate.format("DD/MM/YYYY"))
            console.log("Checking if " + billCycleDate.format("DD/MM/YYYY") + " falls between between " + moment().startOf('day').format("DD/MM/YYYY") + " and " + lastOfNextMonth.endOf('day').format("DD/MM/YYYY"))

            if (moment().startOf('day') <= billCycleDate && billCycleDate <= lastOfNextMonth.endOf('day')) {
                occurrence.occurrenceDate = billCycleDate.endOf('day')

                let ignoreDate = ignoreDates.filter(date => {
                    date = moment(date)
                    return date.format('D') == occurrence.occurrenceDate.format('D')
                        && date.format('M') == occurrence.occurrenceDate.format('M')
                        && date.format('YYYY') == occurrence.occurrenceDate.format('YYYY')
                })

                if (!ignoreDate.length) {
                    console.log("\n\nEntered Ignore Dates block\nDate to ignore= ", occurrence.occurrenceDate.format("DD/MM/YYYY"))
                    const billOccurrence = await BillOccurrence.find({
                        billId: occurrence.billId,
                        occurrenceDate: occurrence.occurrenceDate,
                        isDeleted: false
                    })
                    console.log("BillOccurrence for " + occurrence.occurrenceDate.format("DD/MM/YYYY"), billOccurrence.length ? " found" : " not found")
                    if (!billOccurrence.length) {
                        console.log("\n Creating a new occurrence for ", occurrence.occurrenceDate, "\n", occurrence)
                        await BillOccurrence.create(occurrence);
                    }
                } else {
                    console.log("Occurrence date = ", occurrence.occurrenceDate, ".. Skipping this as it is already paid")
                }
            }
            billCycleDate = addDaysToDate(billCycleDate, repeatsAfter);
        }
    } else {
        console.log("Entered once occurrence block")
        occurrence.occurrenceDate = billCycleDate.endOf('day')
        const billOccurrence = await BillOccurrence.find({
            billId: occurrence.billId,
            occurrenceDate: occurrence.occurrenceDate,
            isDeleted: false
        })
        if (!billOccurrence.length) {
            console.log("\n\n\n once occurrence = ", occurrence)
            BillOccurrence.create(occurrence);
        }
    }
}

async function markOccurrenceAsPaid(occurrenceId) {
    return await BillOccurrence.findOneAndUpdate({ _id: occurrenceId }, { isPaid: true, updatedAt: new Date() });
}
async function getBillOccurrences(options) {
    return await BillOccurrence.find(options).populate([
        {
            path: 'billId',
            populate:
                [{
                    path: 'paymentMethodId',
                    model: PaymentMethodModel,
                },
                {
                    path: 'billCategoryId',
                    model: BillCategoryModel,
                }]
        },
        {
            path: 'paymentMethodId',
            model: PaymentMethodModel,
        },]
    ).sort({ occurrenceDate: 1 });
}
async function getBills() {

    return await Bill.find({ isDeleted: false }).populate([{
        path: 'paymentMethodId',
        model: PaymentMethodModel,
    },
    {
        path: 'billCategoryId',
        model: BillCategoryModel,
    }]).sort({ createdAt: -1 });


}
let job = cron.schedule('0 1 * * *', async function () {
    console.log("\n\n\n ************Cron job started************\n\n\n ")
    let bills = await getBills()
    console.log("Creating occurrences, if any...")
    bills.forEach(bill => {
        createOccurrence(bill);
    })
    let options = {
        isDeleted: false,
        occurrenceDate: {
            $gte: moment().subtract(1, 'day').startOf('day'),
        }
    }
    let occurrences = await getBillOccurrences(options)
    console.log("Checking autopay occurrences...")
    occurrences.forEach(async occurrence => {
        if (moment(occurrence.occurrenceDate) < moment() && occurrence.isAutopay) {
            console.log(occurrence.name, " set to be autopaid on ", moment(occurrence.occurrenceDate).format("DD/MM/YYYY"), " is marked as paid")
            await markOccurrenceAsPaid(occurrence._id);
        }
    })
})
job.start();

module.exports = router;