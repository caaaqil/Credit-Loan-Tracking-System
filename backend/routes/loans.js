const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
} = require('../controllers/loanController');

const router = express.Router();

// @route   GET /api/loans
// @desc    Get all loans
// @access  Private
router.get('/', protect, getLoans);

// @route   POST /api/loans
// @desc    Create new loan
// @access  Private
router.post(
    '/',
    protect,
    [
        body('direction').isIn(['FROM_SHOP', 'TO_CUSTOMER']).withMessage('Invalid direction'),
        body('partyId').notEmpty().withMessage('Party ID is required'),
        body('partyModel').isIn(['Shop', 'Customer']).withMessage('Invalid party model'),
        body('orderLetter').notEmpty().withMessage('Order letter is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('month').isIn(['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'])
            .withMessage('Invalid month'),
        body('year').isNumeric().withMessage('Year must be a number'),
    ],
    createLoan
);

// @route   PUT /api/loans/:id
// @desc    Update loan
// @access  Private
router.put(
    '/:id',
    protect,
    [
        body('orderLetter').optional().notEmpty().withMessage('Order letter cannot be empty'),
        body('amount').optional().isNumeric().withMessage('Amount must be a number'),
        body('month').optional().isIn(['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'])
            .withMessage('Invalid month'),
        body('year').optional().isNumeric().withMessage('Year must be a number'),
    ],
    updateLoan
);

// @route   DELETE /api/loans/:id
// @desc    Delete loan (soft delete)
// @access  Private
router.delete('/:id', protect, deleteLoan);

module.exports = router;
