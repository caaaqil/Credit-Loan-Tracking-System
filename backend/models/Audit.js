const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE'],
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Shop', 'Customer', 'Loan', 'Payment'],
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    before: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    after: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    description: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Indexes for faster queries
auditSchema.index({ userId: 1 });
auditSchema.index({ targetType: 1, targetId: 1 });
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);
