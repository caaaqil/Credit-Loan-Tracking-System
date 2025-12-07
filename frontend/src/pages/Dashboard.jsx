import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalShops: 0,
        totalCustomers: 0,
        totalOutstanding: 0,
        totalOwed: 0,
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchStats();
    }, []);
    const fetchStats = async () => {
        try {
            const [shopsRes, customersRes] = await Promise.all([
                api.get('/shops?limit=1000'),
                api.get('/customers?limit=1000'),
            ]);

            const shops = shopsRes.data.shops || [];
            const customers = customersRes.data.customers || [];

            const totalOutstanding = shops.reduce((sum, shop) => sum + (shop.totalOutstanding || 0), 0);
            const totalOwed = customers.reduce((sum, customer) => sum + (customer.totalOwed || 0), 0);

            setStats({
                totalShops: shops.length,
                totalCustomers: customers.length,
                totalOutstanding,
                totalOwed,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="page-title">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Shops</p>
                            <p className="text-4xl font-bold">{stats.totalShops}</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium mb-1">Total Customers</p>
                            <p className="text-4xl font-bold">{stats.totalCustomers}</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium mb-1">Total Outstanding</p>
                            <p className="text-3xl font-bold">{formatCurrency(stats.totalOutstanding)}</p>
                            <p className="text-red-100 text-xs mt-1">Owed to shops</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Total Owed</p>
                            <p className="text-3xl font-bold">{formatCurrency(stats.totalOwed)}</p>
                            <p className="text-green-100 text-xs mt-1">From customers</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/shops" className="card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">Manage Shops</h2>
                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <p className="text-gray-600">View and manage all shops, track outstanding balances, and add new loans or payments.</p>
                </Link>

                <Link to="/customers" className="card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">Manage Customers</h2>
                        <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <p className="text-gray-600">View and manage all customers, track amounts owed, and record loans or payments.</p>
                </Link>

                <Link to="/reports" className="card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">View Reports</h2>
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <p className="text-gray-600">Generate monthly reports, analyze trends, and export data for accounting purposes.</p>
                </Link>

                <div className="card bg-gradient-to-br from-indigo-50 to-purple-50">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link to="/shops/add" className="block w-full btn-primary text-center">
                            Add New Shop
                        </Link>
                        <Link to="/customers/add" className="block w-full btn-secondary text-center">
                            Add New Customer
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
