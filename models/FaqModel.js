const mongoose = require("mongoose");
const FaqCategory = require("./FaqCategoryModel")

const FaqSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Types.ObjectId, ref: FaqCategory },
    question: {
        type: String,
        required: true,
        min: 1,
        max: 1000,
    },
    type: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        min: 1,
        max: 2500,
    },
    youtubeLink: {
        type: String,
        min: 1,
        max: 500,
    },
    audioLink: {
        type: String,
        min: 1,
        max: 500,
    },
    videoLink: {
        type: String,
        min: 1,
        max: 500,
    },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
})
module.exports = mongoose.model("faqs", FaqSchema);