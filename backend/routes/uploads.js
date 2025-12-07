const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFiles, getImages, getImageById } = require('../controllers/uploadController');

const router = express.Router();

// Upload files
router.post('/', protect, upload.array('files', 10), uploadFiles);

// Get images by folderKey
router.get('/:folderKey', protect, getImages);

// Get single image by ID (public so it can be displayed in <img> tags)
router.get('/image/:id', getImageById);

module.exports = router;
