const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    getShops,
    getShop,
    createShop,
    updateShop,
    deleteShop,
} = require('../controllers/shopController');

const router = express.Router();

// @route   GET /api/shops
// @desc    Get all shops
// @access  Private
router.get('/', protect, getShops);

// @route   GET /api/shops/:id
// @desc    Get single shop
// @access  Private
router.get('/:id', protect, getShop);

// @route   POST /api/shops
// @desc    Create new shop
// @access  Private
router.post(
    '/',
    protect,
    [
        body('name').notEmpty().withMessage('Shop name is required'),
        body('ownerName').notEmpty().withMessage('Owner name is required'),
        body('phone').notEmpty().withMessage('Phone number is required'),
        body('village').notEmpty().withMessage('Village/address is required'),
        body('category').isIn(['Retail', 'Wholesale', 'Service', 'Manufacturing', 'Other'])
            .withMessage('Invalid category'),
    ],
    createShop
);

// @route   PUT /api/shops/:id
// @desc    Update shop
// @access  Private
router.put('/:id', protect, updateShop);

// @route   DELETE /api/shops/:id
// @desc    Delete shop (soft delete)
// @access  Private
router.delete('/:id', protect, deleteShop);

module.exports = router;
