const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Faq = require("../models/FaqModel");
const FaqCategory = require("../models/FaqCategoryModel");

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


// get faq categories
router.get("/categories", validateToken, async (req, res) => {
    const faq = await FaqCategory.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find FAQs"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...faq]
    })
})

router.get("/check-uniqueness-category/:name", validateToken, async (req, res) => {
    const faqExist = await FaqCategory.find({ name: req.params.name, isDeleted: false });
    return res.status(200).send({
        statusCode: 400,
        isUnique: faqExist.length ? false : true
    });
})

// create faq category
router.post("/create-category", validateToken, async (req, res) => {
    const faqExist = await FaqCategory.find({ name: req.body.name });
    console.log(faqExist)
    if (faqExist.length) return res.status(400).send({
        statusCode: 400,
        message: "FAQ category name already exists"
    });

    const faq = await FaqCategory.create(req.body);
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to create FAQ category"
    });
    else return res.status(201).send({
        statusCode: 201,
        message: "FAQ category created successfully.",
        response: { ...faq._doc }
    })
})


// soft delete faq category
router.put("/delete-category", validateToken, async (req, res) => {
    const faq = await FaqCategory.findOneAndUpdate({ _id: req.body.id }, { isDeleted: true, updatedAt: new Date() });
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to delete FAQ category"
    });
    else {

        const faqCategory = await Faq.updateMany({ caterogyId: req.body.id }, { isDeleted: true, updatedAt: new Date() });

        return res.status(200).send({
            statusCode: 200,
            message: "FAQ category deleted successfully.",
            // response: { ...faq }
        })
    }
})

// get faq list
router.get("/list/:categoryId", validateToken, async (req, res) => {
    const faq = await Faq.find({ categoryId: req.params.categoryId, isDeleted: false }).sort({ createdAt: -1 });
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find FAQs"
    });
    else {
        const faqCategory = await FaqCategory.findOne({ _id: req.params.categoryId, isDeleted: false });
        return res.status(200).send({
            statusCode: 200,
            response: { category: faqCategory, faqs: [...faq] }
        })
    }
})

// get faq list - open api
router.get("/public-list/:categoryId", async (req, res) => {

    const faq = await Faq.find({ categoryId: req.params.categoryId, isDeleted: false }, { question: 1, answer: 1, _id: 0 })
        .sort({ createdAt: -1 });
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find FAQs"
    });
    else {
        return res.status(200).send({
            statusCode: 200,
            response: [...faq]
        })
    }
})

// create faq 
router.post("/create", validateToken, async (req, res) => {
    const faq = await Faq.create(req.body);
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message:( "Unable to create FAQ" + (req.body.length > 1 ? "s" : ""))
    });
    else return res.status(201).send({
        statusCode: 201,
        message: ("FAQ" + (req.body.length > 1 ? "s" : "") + " created successfully."),
        response: { ...faq._doc }
    })
})


// soft delete faq 
router.put("/delete", validateToken, async (req, res) => {
    const faq = await Faq.findOneAndUpdate({ _id: req.body.id }, { isDeleted: true, updatedAt: new Date() });
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to delete FAQ"
    });
    else return res.status(200).send({
        statusCode: 200,
        message: "FAQ deleted successfully.",
        response: { ...faq }
    })
})

module.exports = router;