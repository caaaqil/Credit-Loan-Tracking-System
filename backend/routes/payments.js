const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    getPayments,
    createPayment,
    updatePayment,
    deletePayment,
} = require('../controllers/paymentController');

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', protect, getPayments);

// @route   POST /api/payments
// @desc    Create new payment
// @access  Private
router.post(
    '/',
    protect,
    [
        body('direction').isIn(['FROM_SHOP', 'TO_CUSTOMER']).withMessage('Invalid direction'),
        body('partyId').notEmpty().withMessage('Party ID is required'),
        body('partyModel').isIn(['Shop', 'Customer']).withMessage('Invalid party model'),
        body('amountPaid').isNumeric().withMessage('Amount paid must be a number'),
        body('paymentNumber').notEmpty().withMessage('Payment number is required'),
    ],
    createPayment
);

// @route   PUT /api/payments/:id
// @desc    Update payment
// @access  Private
router.put(
    '/:id',
    protect,
    [
        body('paymentNumber').optional().notEmpty().withMessage('Payment number cannot be empty'),
        body('amountPaid').optional().isNumeric().withMessage('Amount paid must be a number'),
        body('datePaid').optional().isISO8601().withMessage('Invalid date format'),
    ],
    updatePayment
);

// @route   DELETE /api/payments/:id
// @desc    Delete payment (soft delete)
// @access  Private
router.delete('/:id', protect, deletePayment);

module.exports = router;
