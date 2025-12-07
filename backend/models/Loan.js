const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
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
    orderLetter: {
        type: String,
        required: [true, 'Please provide order letter'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please provide loan amount'],
        min: 0,
    },
    month: {
        type: String,
        required: [true, 'Please provide month'],
        enum: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
    },
    year: {
        type: Number,
        required: [true, 'Please provide year'],
    },
    imagesFolderKey: {
        type: String,
        default: null,
    },
    balanceAfter: {
        type: Number,
        default: 0,
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
loanSchema.index({ partyId: 1, partyModel: 1 });
loanSchema.index({ direction: 1 });
loanSchema.index({ isDeleted: 1 });
loanSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Loan', loanSchema);
