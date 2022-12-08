const mongoose = require("mongoose");

const FaqCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 1,
        max: 50,
    },
    coverFolderName: {
        type: String,
        required: true,
    },
    coverFileName: {
        type: String,
        required: true,
    },
    coverPath: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
})
module.exports = mongoose.model("faqs-category", FaqCategorySchema);