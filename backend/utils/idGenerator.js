const Shop = require('../models/Shop');
const Customer = require('../models/Customer');

/**
 * Generate next shop code (SHOP-001, SHOP-002, etc.)
 */
const generateShopCode = async () => {
    try {
        // Find the shop with the highest code
        const lastShop = await Shop.findOne()
            .sort({ code: -1 })
            .select('code')
            .lean();

        if (!lastShop || !lastShop.code) {
            return 'SHOP-001';
        }

        // Extract number from code (e.g., "SHOP-001" -> 1)
        const lastNumber = parseInt(lastShop.code.split('-')[1]);
        const nextNumber = lastNumber + 1;

        // Format with leading zeros (e.g., 1 -> "001")
        return `SHOP-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating shop code:', error);
        throw error;
    }
};

/**
 * Generate next customer code (CUST-001, CUST-002, etc.)
 */
const generateCustomerCode = async () => {
    try {
        // Find the customer with the highest code
        const lastCustomer = await Customer.findOne()
            .sort({ code: -1 })
            .select('code')
            .lean();

        if (!lastCustomer || !lastCustomer.code) {
            return 'CUST-001';
        }

        // Extract number from code (e.g., "CUST-001" -> 1)
        const lastNumber = parseInt(lastCustomer.code.split('-')[1]);
        const nextNumber = lastNumber + 1;

        // Format with leading zeros (e.g., 1 -> "001")
        return `CUST-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating customer code:', error);
        throw error;
    }
};

module.exports = {
    generateShopCode,
    generateCustomerCode,
};
