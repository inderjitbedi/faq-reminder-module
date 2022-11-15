const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().required().email()//{ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ca'] } }
});

const loginSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
});

router.post("/register", async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Check if the user is allready in the db
    const emailExists = await User.findOne({ email: req.body.email });

    if (emailExists) return res.status(400).send("Email already exists");

    //hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
    });

    try {
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/login", async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).send({
        statusCode: 400,
        message: "Email or password is wrong"
    });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({
        statusCode: 400,
        message: "Email or password is wrong"
    });

    const auth_token = jwt.sign({ name: user.name, email: user.email, _id: user._id }, process.env.TOKEN_SECRET);
    res.header("Authorization", auth_token).send({ statusCode: 200, response: { auth_token: auth_token } });
});

module.exports = router;