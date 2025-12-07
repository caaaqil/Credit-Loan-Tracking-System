const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} = require('../controllers/customerController');

const router = express.Router();

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private
router.get('/', protect, getCustomers);

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get('/:id', protect, getCustomer);

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private
router.post(
    '/',
    protect,
    [
        body('name').notEmpty().withMessage('Customer name is required'),
        body('phone').notEmpty().withMessage('Phone number is required'),
        body('village').notEmpty().withMessage('Village/place is required'),
        body('category').isIn(['Regular', 'VIP', 'Wholesale', 'Retail', 'Other'])
            .withMessage('Invalid category'),
    ],
    createCustomer
);

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', protect, updateCustomer);

// @route   DELETE /api/customers/:id
// @desc    Delete customer (soft delete)
// @access  Private
router.delete('/:id', protect, deleteCustomer);

module.exports = router;
