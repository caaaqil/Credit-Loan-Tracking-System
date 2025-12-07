const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        default: null,
    },
    direction: {
        type: String,
        required: true,
        enum: ['FROM_SHOP', 'TO_CUSTOMER'],
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'partyModel',
    },
    partyModel: {
        type: String,
        required: true,
        enum: ['Shop', 'Customer'],
    },
    amountPaid: {
        type: Number,
        required: [true, 'Please provide payment amount'],
        min: 0,
    },
    paymentNumber: {
        type: String,
        required: [true, 'Please provide payment number'],
        trim: true,
    },
    datePaid: {
        type: Date,
        default: Date.now,
    },
    imagesFolderKey: {
        type: String,
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Indexes for faster queries
paymentSchema.index({ partyId: 1, partyModel: 1 });
paymentSchema.index({ direction: 1 });
paymentSchema.index({ isDeleted: 1 });
paymentSchema.index({ datePaid: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
