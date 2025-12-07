import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-effect border-b border-gray-200 sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                Credit Tracker
                            </span>
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link
                                to="/"
                                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/shops"
                                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 font-medium"
                            >
                                Shops
                            </Link>
                            <Link
                                to="/customers"
                                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 font-medium"
                            >
                                Customers
                            </Link>
                            <Link
                                to="/reports"
                                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 font-medium"
                            >
                                Reports
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">
                            <span className="text-gray-600">Welcome, </span>
                            <span className="font-semibold text-gray-800">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
