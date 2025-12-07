const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide shop name'],
        trim: true,
    },
    ownerName: {
        type: String,
        required: [true, 'Please provide owner name'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        trim: true,
    },
    village: {
        type: String,
        required: [true, 'Please provide village/address'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['Retail', 'Wholesale', 'Service', 'Manufacturing', 'Other'],
    },
    registerDate: {
        type: Date,
        default: Date.now,
    },
    totalOutstanding: {
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
shopSchema.index({ code: 1 });
shopSchema.index({ isDeleted: 1 });
shopSchema.index({ category: 1 });

module.exports = mongoose.model('Shop', shopSchema);
