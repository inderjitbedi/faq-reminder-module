const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    dob: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model("users", UserSchema);