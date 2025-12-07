const Image = require('../models/Image');

/**
 * @desc    Upload files to MongoDB
 * @route   POST /api/uploads
 * @access  Private
 */
const uploadFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const { partyModel, partyId, type } = req.body;
        const folderKey = `${type}-${partyId}-${Date.now()}`;

        // Store each file in MongoDB as Base64
        const uploadedImages = [];

        for (const file of req.files) {
            // Convert buffer to Base64
            const base64Data = file.buffer.toString('base64');

            // Create image document
            const image = await Image.create({
                folderKey,
                fileName: file.originalname,
                mimeType: file.mimetype,
                data: base64Data,
                size: file.size,
                uploadedBy: req.user._id,
            });

            uploadedImages.push({
                fileName: file.originalname,
                url: `/api/uploads/image/${image._id}`,
                imageId: image._id,
            });
        }

        res.status(200).json({
            success: true,
            folderKey,
            images: uploadedImages,
            message: `${uploadedImages.length} file(s) uploaded successfully to MongoDB`,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get images by folderKey
 * @route   GET /api/uploads/:folderKey
 * @access  Private
 */
const getImages = async (req, res) => {
    try {
        const { folderKey } = req.params;

        if (!folderKey) {
            return res.status(400).json({ message: 'Folder key is required' });
        }

        // Find all images with this folderKey
        const images = await Image.find({ folderKey }).sort({ uploadedAt: 1 });

        if (!images || images.length === 0) {
            return res.status(200).json({
                success: true,
                folderKey,
                images: [],
                message: 'No images found for this folder',
            });
        }

        // Return image metadata (not the full Base64 data)
        const imageList = images.map(img => ({
            fileName: img.fileName,
            url: `/api/uploads/image/${img._id}`,
            imageId: img._id,
            mimeType: img.mimeType,
            size: img.size,
            uploadedAt: img.uploadedAt,
        }));

        res.status(200).json({
            success: true,
            folderKey,
            images: imageList,
        });
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get single image by ID
 * @route   GET /api/uploads/image/:id
 * @access  Public (so images can be displayed in <img> tags)
 */
const getImageById = async (req, res) => {
    try {
        const { id } = req.params;

        const image = await Image.findById(id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Convert Base64 back to buffer
        const imgBuffer = Buffer.from(image.data, 'base64');

        // Set appropriate headers
        res.set('Content-Type', image.mimeType);
        res.set('Content-Length', imgBuffer.length);
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        // Send the image
        res.send(imgBuffer);
    } catch (error) {
        console.error('Get image by ID error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    uploadFiles,
    getImages,
    getImageById,
};
