const mongoose = require("mongoose");


const FaqSchema = new mongoose.Schema({

    question: {
        type: String,
        required: true,
        min: 2,
        max: 2550,
    },
    answer: {
        type: String,
        required: true,
        min: 2,
        max: 2550,
    },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
})
module.exports = mongoose.model("faqs", FaqSchema);