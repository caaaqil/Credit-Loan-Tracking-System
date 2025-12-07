const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Loan = require('../models/Loan');
const Shop = require('../models/Shop');
const Customer = require('../models/Customer');
const Audit = require('../models/Audit');

/**
 * @desc    Get all loans
 * @route   GET /api/loans
 * @access  Private
 */
const getLoans = async (req, res) => {
    try {
        const { page = 1, limit = 10, direction = '', partyId = '', month = '', year = '' } = req.query;

        const query = { isDeleted: false };

        if (direction) {
            query.direction = direction;
        }

        if (partyId) {
            query.partyId = partyId;
        }

        if (month) {
            query.month = month;
        }

        if (year) {
            query.year = parseInt(year);
        }

        const loans = await Loan.find(query)
            .populate('partyId')
            .populate('createdBy', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Loan.countDocuments(query);

        res.json({
            success: true,
            loans,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Create new loan
 * @route   POST /api/loans
 * @access  Private
 */
const createLoan = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { direction, partyId, partyModel, orderLetter, amount, month, year, imagesFolderKey } = req.body;

        // Validate party exists
        const PartyModel = partyModel === 'Shop' ? Shop : Customer;
        const party = await PartyModel.findById(partyId);

        if (!party || party.isDeleted) {
            return res.status(404).json({ message: `${partyModel} not found` });
        }

        // Update party balance
        if (direction === 'FROM_SHOP' && partyModel === 'Shop') {
            party.totalOutstanding += amount;
        } else if (direction === 'TO_CUSTOMER' && partyModel === 'Customer') {
            party.totalOwed += amount;
        } else {
            return res.status(400).json({ message: 'Invalid direction and partyModel combination' });
        }

        await party.save();

        // Create loan
        const loan = new Loan({
            direction,
            partyId,
            partyModel,
            orderLetter,
            amount,
            month,
            year,
            imagesFolderKey,
            balanceAfter: direction === 'FROM_SHOP' ? party.totalOutstanding : party.totalOwed,
            createdBy: req.user._id,
        });

        await loan.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'CREATE',
            targetType: 'Loan',
            targetId: loan._id,
            after: loan.toObject(),
            description: `Created loan: ${amount} for ${party.name || party.ownerName} (${direction})`,
        });

        // Populate and return
        await loan.populate('partyId');
        await loan.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            loan,
        });
    } catch (error) {
        console.error('Create loan error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update loan
 * @route   PUT /api/loans/:id
 * @access  Private
 */
const updateLoan = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log('=== UPDATE LOAN REQUEST ===');
    console.log('Loan ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan || loan.isDeleted) {
            console.log('Loan not found or deleted');
            return res.status(404).json({ message: 'Loan not found' });
        }

        console.log('Found loan:', loan.toObject());

        const before = loan.toObject();
        const { orderLetter, amount, month, year, imagesFolderKey } = req.body;

        // Get party
        const PartyModel = loan.partyModel === 'Shop' ? Shop : Customer;
        const party = await PartyModel.findById(loan.partyId);

        if (!party || party.isDeleted) {
            console.log('Party not found or deleted');
            return res.status(404).json({ message: `${loan.partyModel} not found` });
        }

        console.log('Found party:', party.name || party.ownerName);

        // If amount changed, recalculate balance
        if (amount && amount !== loan.amount) {
            const delta = amount - loan.amount;
            console.log('Amount changed. Delta:', delta);

            if (loan.direction === 'FROM_SHOP') {
                party.totalOutstanding += delta;
            } else {
                party.totalOwed += delta;
            }

            await party.save();
            loan.amount = amount;
            loan.balanceAfter = loan.direction === 'FROM_SHOP' ? party.totalOutstanding : party.totalOwed;
        }

        // Update other fields
        if (orderLetter) loan.orderLetter = orderLetter;
        if (month) loan.month = month;
        if (year) loan.year = year;
        if (imagesFolderKey !== undefined) loan.imagesFolderKey = imagesFolderKey;

        await loan.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'UPDATE',
            targetType: 'Loan',
            targetId: loan._id,
            before,
            after: loan.toObject(),
            description: `Updated loan for ${party.name || party.ownerName}`,
        });

        await loan.populate('partyId');
        await loan.populate('createdBy', 'name email');

        console.log('Loan updated successfully');

        res.json({
            success: true,
            loan,
        });
    } catch (error) {
        console.error('Update loan error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Delete loan (soft delete and reverse balance)
 * @route   DELETE /api/loans/:id
 * @access  Private
 */
const deleteLoan = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan || loan.isDeleted) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        const before = loan.toObject();

        // Get party and reverse balance
        const PartyModel = loan.partyModel === 'Shop' ? Shop : Customer;
        const party = await PartyModel.findById(loan.partyId);

        if (party && !party.isDeleted) {
            if (loan.direction === 'FROM_SHOP') {
                party.totalOutstanding -= loan.amount;
            } else {
                party.totalOwed -= loan.amount;
            }
            await party.save();
        }

        loan.isDeleted = true;
        await loan.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'DELETE',
            targetType: 'Loan',
            targetId: loan._id,
            before,
            after: loan.toObject(),
            description: `Deleted loan: ${loan.amount} (reversed balance)`,
        });

        res.json({
            success: true,
            message: 'Loan deleted successfully',
        });
    } catch (error) {
        console.error('Delete loan error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
};
