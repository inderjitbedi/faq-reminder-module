const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Faq = require("../models/FaqModel");



function getToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== undefined) {
        const bearer = bearerHeader.split(' ');
        token = bearer[1];
        req.token = token;
        next();
    } else {
        res.status(401).send({
            statusCode: 401,
            message: "Unauthorized"
        });
    }
}

// get faq list
router.get("/list", getToken, async (req, res) => {
    jwt.verify(req.token, process.env.TOKEN_SECRET, (err, authData) => {
        if (err) {
            res.status(401).send({
                statusCode: 401,
                message: "Unauthorized"
            });
        } else {
            return getfaq(res);
        }
    })
})
async function getfaq(res) {
    const faq = await Faq.find({ isDeleted: false }).sort({createdAt: -1});
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find FAQs"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...faq]
    })
}



// create faq 
router.post("/create", getToken, async (req, res) => {
    jwt.verify(req.token, process.env.TOKEN_SECRET, (err, authData) => {
        if (err) {
            res.status(401).send({
                statusCode: 401,
                message: "Unauthorized"
            });
        } else {
            return createFaq(req, res);
        }
    })
})
async function createFaq(req, res) {
    const faq = await Faq.create(req.body);
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to create FAQ"
    });
    else return res.status(201).send({
        statusCode: 201,
        message: "FAQ created successfully.",
        response: { ...faq._doc }
    })
}


// soft delete faq 
router.put("/delete", getToken, async (req, res) => {
    jwt.verify(req.token, process.env.TOKEN_SECRET, (err, authData) => {
        if (err) {
            res.status(401).send({
                statusCode: 401,
                message: "Unauthorized"
            });
        } else {
            return deleteFaq(req, res);
        }
    })
})
async function deleteFaq(req, res) {
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
}


module.exports = router;