const mongoose = require("mongoose");


const PaymentMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    isDeleted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
})
module.exports =mongoose.model("payment-methods", PaymentMethodSchema);
 
