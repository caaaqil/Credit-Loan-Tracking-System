const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide customer name'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        trim: true,
    },
    village: {
        type: String,
        required: [true, 'Please provide village/place'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['Regular', 'VIP', 'Wholesale', 'Retail', 'Other'],
    },
    registerDate: {
        type: Date,
        default: Date.now,
    },
    totalOwed: {
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

// Index for faster queries
customerSchema.index({ code: 1 });
customerSchema.index({ isDeleted: 1 });
customerSchema.index({ category: 1 });

module.exports = mongoose.model('Customer', customerSchema);
