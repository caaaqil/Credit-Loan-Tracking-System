import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shops from './pages/Shops';
import ShopDetail from './pages/ShopDetail';
import AddShop from './pages/AddShop';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import AddCustomer from './pages/AddCustomer';
import Reports from './pages/Reports';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen">
            {isAuthenticated && <Navbar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shops"
                    element={
                        <ProtectedRoute>
                            <Shops />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shops/add"
                    element={
                        <ProtectedRoute>
                            <AddShop />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shops/:id"
                    element={
                        <ProtectedRoute>
                            <ShopDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customers"
                    element={
                        <ProtectedRoute>
                            <Customers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customers/add"
                    element={
                        <ProtectedRoute>
                            <AddCustomer />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customers/:id"
                    element={
                        <ProtectedRoute>
                            <CustomerDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
