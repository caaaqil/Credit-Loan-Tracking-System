import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoanFormModal from '../components/LoanFormModal';
import PaymentFormModal from '../components/PaymentFormModal';
import EditCustomerModal from '../components/EditCustomerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageGallery from '../components/ImageGallery';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loans, setLoans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [deletingLoan, setDeletingLoan] = useState(null);
    const [deletingPayment, setDeletingPayment] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [viewingImages, setViewingImages] = useState(null);
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [customerRes, loansRes, paymentsRes] = await Promise.all([
                api.get(`/customers/${id}`),
                api.get(`/loans?partyId=${id}&limit=100`),
                api.get(`/payments?partyId=${id}&limit=100`),
            ]);

            setCustomer(customerRes.data.customer);
            setLoans(loansRes.data.loans || []);
            setPayments(paymentsRes.data.payments || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 404) {
                navigate('/customers');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLoan = async () => {
        setDeleteLoading(true);
        try {
            await api.delete(`/loans/${deletingLoan._id}`);
            setDeletingLoan(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting loan:', error);
            alert('Failed to delete loan');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeletePayment = async () => {
        setDeleteLoading(true);
        try {
            await api.delete(`/payments/${deletingPayment._id}`);
            setDeletingPayment(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting payment:', error);
            alert('Failed to delete payment');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleViewImages = async (folderKey) => {
        setLoadingImages(true);
        setViewingImages(folderKey);
        try {
            const response = await api.get(`/uploads/${folderKey}`);
            setImages(response.data.images || []);
        } catch (error) {
            console.error('Error loading images:', error);
            setImages([]);
        } finally {
            setLoadingImages(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary-600"></div>
            </div>
        );
    }

    if (!customer) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate('/customers')}
                className="mb-6 flex items-center text-secondary-600 hover:text-secondary-700 font-medium"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Customers
            </button>

            <div className="card mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="badge badge-info mb-2">{customer.code}</span>
                        <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="badge badge-success">{customer.category}</span>
                        <button
                            onClick={() => setEditingCustomer(true)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit customer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">{customer.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Village</p>
                        <p className="font-semibold text-gray-800">{customer.village}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Registered</p>
                        <p className="font-semibold text-gray-800">{formatDate(customer.registerDate)}</p>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700">Total Owed:</span>
                        <span className={`text-3xl font-bold ${customer.totalOwed > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {formatCurrency(customer.totalOwed)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <button
                    onClick={() => setShowLoanModal(true)}
                    className="btn-primary w-full"
                >
                    + Add Loan
                </button>
                <button
                    onClick={() => setShowPaymentModal(true)}
                    className="btn-secondary w-full"
                >
                    + Add Payment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="section-title">Loans ({loans.length})</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {loans.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No loans recorded</p>
                        ) : (
                            loans.map((loan) => (
                                <div key={loan._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{loan.orderLetter}</p>
                                            <p className="text-sm text-gray-600">{loan.month} {loan.year}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(loan.amount)}
                                            </span>
                                            {loan.imagesFolderKey && (
                                                <button
                                                    onClick={() => handleViewImages(loan.imagesFolderKey)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="View images"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingLoan(loan)}
                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Edit loan"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeletingLoan(loan)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete loan"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">{formatDate(loan.createdAt)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card">
                    <h2 className="section-title">Payments ({payments.length})</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {payments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No payments recorded</p>
                        ) : (
                            payments.map((payment) => (
                                <div key={payment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">Payment #{payment.paymentNumber}</p>
                                            <p className="text-sm text-gray-600">{formatDate(payment.datePaid)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold text-red-600">
                                                -{formatCurrency(payment.amountPaid)}
                                            </span>
                                            {payment.imagesFolderKey && (
                                                <button
                                                    onClick={() => handleViewImages(payment.imagesFolderKey)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="View images"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingPayment(payment)}
                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Edit payment"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeletingPayment(payment)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete payment"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <LoanFormModal
                isOpen={showLoanModal || !!editingLoan}
                onClose={() => {
                    setShowLoanModal(false);
                    setEditingLoan(null);
                }}
                party={customer}
                partyModel="Customer"
                loan={editingLoan}
                onSuccess={fetchData}
            />

            <PaymentFormModal
                isOpen={showPaymentModal || !!editingPayment}
                onClose={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                }}
                party={customer}
                partyModel="Customer"
                payment={editingPayment}
                onSuccess={fetchData}
            />

            <EditCustomerModal
                isOpen={editingCustomer}
                onClose={() => setEditingCustomer(false)}
                customer={customer}
                onSuccess={fetchData}
            />

            <ConfirmDialog
                isOpen={!!deletingLoan}
                onClose={() => setDeletingLoan(null)}
                onConfirm={handleDeleteLoan}
                title="Delete Loan"
                message={`Are you sure you want to delete this loan (${deletingLoan?.orderLetter})? This will reverse the balance and cannot be undone.`}
                loading={deleteLoading}
            />

            <ConfirmDialog
                isOpen={!!deletingPayment}
                onClose={() => setDeletingPayment(null)}
                onConfirm={handleDeletePayment}
                title="Delete Payment"
                message={`Are you sure you want to delete this payment (#${deletingPayment?.paymentNumber})? This will reverse the balance and cannot be undone.`}
                loading={deleteLoading}
            />

            <ImageGallery
                isOpen={!!viewingImages && !loadingImages}
                onClose={() => {
                    setViewingImages(null);
                    setImages([]);
                }}
                images={images}
                folderKey={viewingImages}
            />
        </div>
    );
};

export default CustomerDetail;
