const { validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const Audit = require('../models/Audit');
const { generateShopCode } = require('../utils/idGenerator');

/**
 * @desc    Get all shops
 * @route   GET /api/shops
 * @access  Private
 */
const getShops = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', category = '' } = req.query;

        const query = { isDeleted: false };

        // Search by name or owner name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        const shops = await Shop.find(query)
            .populate('createdBy', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Shop.countDocuments(query);

        res.json({
            success: true,
            shops,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error('Get shops error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get single shop
 * @route   GET /api/shops/:id
 * @access  Private
 */
const getShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('createdBy', 'name email');

        if (!shop || shop.isDeleted) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.json({
            success: true,
            shop,
        });
    } catch (error) {
        console.error('Get shop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Create new shop
 * @route   POST /api/shops
 * @access  Private
 */
const createShop = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, ownerName, phone, village, category, registerDate } = req.body;

        // Generate shop code
        const code = await generateShopCode();

        const shop = new Shop({
            code,
            name,
            ownerName,
            phone,
            village,
            category,
            registerDate: registerDate || Date.now(),
            createdBy: req.user._id,
        });

        await shop.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'CREATE',
            targetType: 'Shop',
            targetId: shop._id,
            after: shop.toObject(),
            description: `Created shop: ${shop.name} (${shop.code})`,
        });

        res.status(201).json({
            success: true,
            shop,
        });
    } catch (error) {
        console.error('Create shop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update shop
 * @route   PUT /api/shops/:id
 * @access  Private
 */
const updateShop = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let shop = await Shop.findById(req.params.id);

        if (!shop || shop.isDeleted) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const before = shop.toObject();

        const { name, ownerName, phone, village, category } = req.body;

        shop.name = name || shop.name;
        shop.ownerName = ownerName || shop.ownerName;
        shop.phone = phone || shop.phone;
        shop.village = village || shop.village;
        shop.category = category || shop.category;

        await shop.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'UPDATE',
            targetType: 'Shop',
            targetId: shop._id,
            before,
            after: shop.toObject(),
            description: `Updated shop: ${shop.name} (${shop.code})`,
        });

        res.json({
            success: true,
            shop,
        });
    } catch (error) {
        console.error('Update shop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Delete shop (soft delete)
 * @route   DELETE /api/shops/:id
 * @access  Private
 */
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop || shop.isDeleted) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const before = shop.toObject();

        shop.isDeleted = true;
        await shop.save();

        // Create audit log
        await Audit.create({
            userId: req.user._id,
            action: 'DELETE',
            targetType: 'Shop',
            targetId: shop._id,
            before,
            after: shop.toObject(),
            description: `Deleted shop: ${shop.name} (${shop.code})`,
        });

        res.json({
            success: true,
            message: 'Shop deleted successfully',
        });
    } catch (error) {
        console.error('Delete shop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getShops,
    getShop,
    createShop,
    updateShop,
    deleteShop,
};
