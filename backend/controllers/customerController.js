const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Audit = require('../models/Audit');
const { generateCustomerCode } = require('../utils/idGenerator');

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
const getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', category = '' } = req.query;

        const query = { isDeleted: false };

        // Search by name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        const customers = await Customer.find(query)
            .populate('createdBy', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Customer.countDocuments(query);

        res.json({
            success: true,
            customers,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get single customer
 * @route   GET /api/customers/:id
 * @access  Private
 */
const getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');

        if (!customer || customer.isDeleted) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, phone, village, category, registerDate } = req.body;

        // Generate customer code
        const code = await generateCustomerCode();

        const customer = new Customer({
            code,
            name,
            phone,
            village,
            category,
            registerDate: registerDate || Date.now(),
            createdBy: req.user._id,
        });

        await customer.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'CREATE',
            targetType: 'Customer',
            targetId: customer._id,
            after: customer.toObject(),
            description: `Created customer: ${customer.name} (${customer.code})`,
        });

        res.status(201).json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let customer = await Customer.findById(req.params.id);

        if (!customer || customer.isDeleted) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const before = customer.toObject();

        const { name, phone, village, category } = req.body;

        customer.name = name || customer.name;
        customer.phone = phone || customer.phone;
        customer.village = village || customer.village;
        customer.category = category || customer.category;

        await customer.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'UPDATE',
            targetType: 'Customer',
            targetId: customer._id,
            before,
            after: customer.toObject(),
            description: `Updated customer: ${customer.name} (${customer.code})`,
        });

        res.json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Delete customer (soft delete)
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer || customer.isDeleted) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const before = customer.toObject();

        customer.isDeleted = true;
        await customer.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'DELETE',
            targetType: 'Customer',
            targetId: customer._id,
            before,
            after: customer.toObject(),
            description: `Deleted customer: ${customer.name} (${customer.code})`,
        });

        res.json({
            success: true,
            message: 'Customer deleted successfully',
        });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
};
