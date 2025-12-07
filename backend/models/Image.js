const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    folderKey: {
        type: String,
        required: true,
        index: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    data: {
        type: String, // Base64 encoded image data
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
imageSchema.index({ folderKey: 1, uploadedAt: -1 });

module.exports = mongoose.model('Image', imageSchema);
