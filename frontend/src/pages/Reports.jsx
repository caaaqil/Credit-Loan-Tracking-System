import React, { useState } from 'react';
import api from '../services/api';

const Reports = () => {
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/reports/monthly?month=${month}&year=${year}`);
            setReport(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const downloadCSV = () => {
        if (!report) return;

        const csvData = [
            ['Credit/Loan Tracking System - Monthly Report'],
            [`Month: ${month} ${year}`],
            [''],
            ['SHOPS SUMMARY'],
            ['Total Loans', formatCurrency(report.report.shops.totalLoans)],
            ['Total Payments', formatCurrency(report.report.shops.totalPayments)],
            ['Net Change', formatCurrency(report.report.shops.netChange)],
            ['Loans Count', report.report.shops.loansCount],
            ['Payments Count', report.report.shops.paymentsCount],
            [''],
            ['CUSTOMERS SUMMARY'],
            ['Total Loans', formatCurrency(report.report.customers.totalLoans)],
            ['Total Payments', formatCurrency(report.report.customers.totalPayments)],
            ['Net Change', formatCurrency(report.report.customers.netChange)],
            ['Loans Count', report.report.customers.loansCount],
            ['Payments Count', report.report.customers.paymentsCount],
            [''],
            ['CURRENT TOTALS'],
            ['Total Outstanding (All Shops)', formatCurrency(report.report.currentTotals.totalOutstandingAllShops)],
            ['Total Owed (All Customers)', formatCurrency(report.report.currentTotals.totalOwedAllCustomers)],
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${month}-${year}.csv`;
        a.click();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="page-title">Monthly Reports</h1>

            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="label">Month</label>
                        <select
                            className="input-field"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            {months.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Year</label>
                        <input
                            type="number"
                            className="input-field"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {report && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="section-title mb-0">Report for {month} {year}</h2>
                        <button onClick={downloadCSV} className="btn-secondary">
                            Download CSV
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Shops Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Loans:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(report.report.shops.totalLoans)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Payments:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(report.report.shops.totalPayments)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-3">
                                    <span className="text-gray-700 font-semibold">Net Change:</span>
                                    <span className={`font-bold ${report.report.shops.netChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(report.report.shops.netChange)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Loans Count:</span>
                                    <span className="font-semibold">{report.report.shops.loansCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payments Count:</span>
                                    <span className="font-semibold">{report.report.shops.paymentsCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-purple-50 to-pink-50">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Customers Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Loans:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(report.report.customers.totalLoans)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Payments:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(report.report.customers.totalPayments)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-3">
                                    <span className="text-gray-700 font-semibold">Net Change:</span>
                                    <span className={`font-bold ${report.report.customers.netChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(report.report.customers.netChange)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Loans Count:</span>
                                    <span className="font-semibold">{report.report.customers.loansCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payments Count:</span>
                                    <span className="font-semibold">{report.report.customers.paymentsCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Current Totals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Outstanding (All Shops):</span>
                                <span className="font-bold text-red-600 text-xl">
                                    {formatCurrency(report.report.currentTotals.totalOutstandingAllShops)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Owed (All Customers):</span>
                                <span className="font-bold text-green-600 text-xl">
                                    {formatCurrency(report.report.currentTotals.totalOwedAllCustomers)}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
