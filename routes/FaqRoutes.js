const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Faq = require("../models/FaqModel");

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

// get faq list
router.get("/list", validateToken, async (req, res) => {
    const faq = await Faq.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find FAQs"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...faq]
    })
})

// get faq list - open api
router.get("/public-list", async (req, res) => {
    const faq = await Faq.find({ isDeleted: false }, { question: 1, answer: 1, _id: 0 }).sort({ createdAt: -1 });
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to find FAQs"
    });
    else return res.status(200).send({
        statusCode: 200,
        response: [...faq]
    })
})

// create faq 
router.post("/create", validateToken, async (req, res) => {
    const faq = await Faq.create(req.body);
    if (!faq) return res.status(400).send({
        statusCode: 400,
        message: "Unable to create FAQ" + (req?.body?.length > 1 ? "s" : "")
    });
    else return res.status(201).send({
        statusCode: 201,
        message: "FAQ" + (req?.body?.length > 1 ? "s" : "") + " created successfully.",
        // response: { ...faq._doc }
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