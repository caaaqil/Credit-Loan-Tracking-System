const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Shop = require('../models/Shop');
const Customer = require('../models/Customer');

/**
 * @desc    Get monthly report
 * @route   GET /api/reports/monthly
 * @access  Private
 */
const getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        const query = {
            isDeleted: false,
            month,
            year: parseInt(year),
        };

        // Get all loans for the month
        const loans = await Loan.find(query).populate('partyId');

        // Get all payments for the month
        const startDate = new Date(year, getMonthNumber(month) - 1, 1);
        const endDate = new Date(year, getMonthNumber(month), 0, 23, 59, 59);

        const payments = await Payment.find({
            isDeleted: false,
            datePaid: { $gte: startDate, $lte: endDate },
        }).populate('partyId');

        // Aggregate by shop
        const shopLoans = loans.filter(l => l.direction === 'FROM_SHOP');
        const shopPayments = payments.filter(p => p.direction === 'FROM_SHOP');

        // Aggregate by customer
        const customerLoans = loans.filter(l => l.direction === 'TO_CUSTOMER');
        const customerPayments = payments.filter(p => p.direction === 'TO_CUSTOMER');

        // Calculate totals
        const totalLoansFromShops = shopLoans.reduce((sum, loan) => sum + loan.amount, 0);
        const totalPaymentsToShops = shopPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
        const totalLoansToCustomers = customerLoans.reduce((sum, loan) => sum + loan.amount, 0);
        const totalPaymentsFromCustomers = customerPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);

        // Get current totals
        const shops = await Shop.find({ isDeleted: false });
        const customers = await Customer.find({ isDeleted: false });

        const totalOutstandingAllShops = shops.reduce((sum, shop) => sum + shop.totalOutstanding, 0);
        const totalOwedAllCustomers = customers.reduce((sum, customer) => sum + customer.totalOwed, 0);

        res.json({
            success: true,
            month,
            year,
            report: {
                shops: {
                    loansCount: shopLoans.length,
                    paymentsCount: shopPayments.length,
                    totalLoans: totalLoansFromShops,
                    totalPayments: totalPaymentsToShops,
                    netChange: totalLoansFromShops - totalPaymentsToShops,
                },
                customers: {
                    loansCount: customerLoans.length,
                    paymentsCount: customerPayments.length,
                    totalLoans: totalLoansToCustomers,
                    totalPayments: totalPaymentsFromCustomers,
                    netChange: totalLoansToCustomers - totalPaymentsFromCustomers,
                },
                currentTotals: {
                    totalOutstandingAllShops,
                    totalOwedAllCustomers,
                },
            },
            loans,
            payments,
        });
    } catch (error) {
        console.error('Get monthly report error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Helper function to convert month name to number
const getMonthNumber = (monthName) => {
    const months = {
        January: 1, February: 2, March: 3, April: 4,
        May: 5, June: 6, July: 7, August: 8,
        September: 9, October: 10, November: 11, December: 12,
    };
    return months[monthName] || 1;
};

module.exports = {
    getMonthlyReport,
};
