const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Shop = require('../models/Shop');
const Customer = require('../models/Customer');
const Audit = require('../models/Audit');

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private
 */
const getPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, direction = '', partyId = '' } = req.query;

        const query = { isDeleted: false };

        if (direction) {
            query.direction = direction;
        }

        if (partyId) {
            query.partyId = partyId;
        }

        const payments = await Payment.find(query)
            .populate('partyId')
            .populate('loanId')
            .populate('createdBy', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Payment.countDocuments(query);

        res.json({
            success: true,
            payments,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Create new payment
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { loanId, direction, partyId, partyModel, amountPaid, paymentNumber, datePaid, imagesFolderKey } = req.body;

        // Validate party exists
        const PartyModel = partyModel === 'Shop' ? Shop : Customer;
        const party = await PartyModel.findById(partyId);

        if (!party || party.isDeleted) {
            return res.status(404).json({ message: `${partyModel} not found` });
        }

        // Update party balance
        if (direction === 'FROM_SHOP' && partyModel === 'Shop') {
            party.totalOutstanding -= amountPaid;
            if (party.totalOutstanding < 0) party.totalOutstanding = 0;
        } else if (direction === 'TO_CUSTOMER' && partyModel === 'Customer') {
            party.totalOwed -= amountPaid;
            if (party.totalOwed < 0) party.totalOwed = 0;
        } else {
            return res.status(400).json({ message: 'Invalid direction and partyModel combination' });
        }

        await party.save();

        // Create payment
        const payment = new Payment({
            loanId: loanId || null,
            direction,
            partyId,
            partyModel,
            amountPaid,
            paymentNumber,
            datePaid: datePaid || Date.now(),
            imagesFolderKey,
            createdBy: req.user._id,
        });

        await payment.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'CREATE',
            targetType: 'Payment',
            targetId: payment._id,
            after: payment.toObject(),
            description: `Created payment: ${amountPaid} from ${party.name || party.ownerName} (${direction})`,
        });

        // Populate and return
        await payment.populate('partyId');
        await payment.populate('loanId');
        await payment.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update payment
 * @route   PUT /api/payments/:id
 * @access  Private
 */
const updatePayment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment || payment.isDeleted) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const before = payment.toObject();
        const { amountPaid, paymentNumber, datePaid, imagesFolderKey } = req.body;

        // Get party
        const PartyModel = payment.partyModel === 'Shop' ? Shop : Customer;
        const party = await PartyModel.findById(payment.partyId);

        if (!party || party.isDeleted) {
            return res.status(404).json({ message: `${payment.partyModel} not found` });
        }

        // If amount changed, recalculate balance
        if (amountPaid && amountPaid !== payment.amountPaid) {
            const delta = amountPaid - payment.amountPaid;

            if (payment.direction === 'FROM_SHOP') {
                party.totalOutstanding -= delta;
                if (party.totalOutstanding < 0) party.totalOutstanding = 0;
            } else {
                party.totalOwed -= delta;
                if (party.totalOwed < 0) party.totalOwed = 0;
            }

            await party.save();
            payment.amountPaid = amountPaid;
        }

        // Update other fields
        if (paymentNumber) payment.paymentNumber = paymentNumber;
        if (datePaid) payment.datePaid = datePaid;
        if (imagesFolderKey !== undefined) payment.imagesFolderKey = imagesFolderKey;

        await payment.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'UPDATE',
            targetType: 'Payment',
            targetId: payment._id,
            before,
            after: payment.toObject(),
            description: `Updated payment for ${party.name || party.ownerName}`,
        });

        await payment.populate('partyId');
        await payment.populate('loanId');
        await payment.populate('createdBy', 'name email');

        res.json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Delete payment (soft delete and reverse balance)
 * @route   DELETE /api/payments/:id
 * @access  Private
 */
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment || payment.isDeleted) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const before = payment.toObject();

        // Get party and reverse balance
        const PartyModel = payment.partyModel === 'Shop' ? Shop : Customer;
        const party = await PartyModel.findById(payment.partyId);

        if (party && !party.isDeleted) {
            if (payment.direction === 'FROM_SHOP') {
                party.totalOutstanding += payment.amountPaid;
            } else {
                party.totalOwed += payment.amountPaid;
            }
            await party.save();
        }

        payment.isDeleted = true;
        await payment.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'DELETE',
            targetType: 'Payment',
            targetId: payment._id,
            before,
            after: payment.toObject(),
            description: `Deleted payment: ${payment.amountPaid} (reversed balance)`,
        });

        res.json({
            success: true,
            message: 'Payment deleted successfully',
        });
    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getPayments,
    createPayment,
    updatePayment,
    deletePayment,
};
