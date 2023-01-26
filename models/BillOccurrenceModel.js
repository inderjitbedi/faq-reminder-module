const mongoose = require("mongoose");
const Bill = require("./BillModel");
const BillCategory = require("./BillCategoryModel");
const PaymentMethod = require("./PaymentMethodModel");


const BillOccurrenceSchema = new mongoose.Schema({
    billId: { type: mongoose.Types.ObjectId, ref: Bill },
    name: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethodId: { type: mongoose.Types.ObjectId, ref: PaymentMethod },
    billCategoryId: { type: mongoose.Types.ObjectId, ref: BillCategory },
    note: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    memo: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    payee: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    isAutopay: { type: Boolean, default: true },
    repeatsAfter: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    occurrenceDate: { type: Date, default: null },
    isPaid: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model("bill-occurrences", BillOccurrenceSchema);