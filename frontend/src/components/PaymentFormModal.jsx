import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const PaymentFormModal = ({ isOpen, onClose, party, partyModel, payment = null, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [files, setFiles] = useState([]);
    const isEditMode = !!payment;

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            datePaid: new Date().toISOString().split('T')[0],
        }
    });

    // Pre-fill form when editing
    useEffect(() => {
        if (isEditMode && payment) {
            setValue('paymentNumber', payment.paymentNumber);
            setValue('amountPaid', payment.amountPaid);
            setValue('datePaid', new Date(payment.datePaid).toISOString().split('T')[0]);
        } else {
            reset({
                datePaid: new Date().toISOString().split('T')[0],
            });
        }
    }, [payment, isEditMode, setValue, reset]);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        try {
            let imagesFolderKey = isEditMode ? payment.imagesFolderKey : null;

            // Upload files if any
            if (files.length > 0) {
                const formData = new FormData();
                files.forEach(file => formData.append('files', file));
                formData.append('partyModel', partyModel);
                formData.append('partyId', party._id);
                formData.append('type', 'payment');

                const uploadRes = await api.post('/uploads', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imagesFolderKey = uploadRes.data.folderKey;
            }

            if (isEditMode) {
                // When editing, only send editable fields
                const updateData = {
                    paymentNumber: data.paymentNumber,
                    amountPaid: parseFloat(data.amountPaid),
                    datePaid: data.datePaid,
                    imagesFolderKey,
                };
                await api.put(`/payments/${payment._id}`, updateData);
            } else {
                // When creating, send all required fields
                const paymentData = {
                    direction: partyModel === 'Shop' ? 'FROM_SHOP' : 'TO_CUSTOMER',
                    partyId: party._id,
                    partyModel,
                    amountPaid: parseFloat(data.amountPaid),
                    paymentNumber: data.paymentNumber,
                    datePaid: data.datePaid,
                    imagesFolderKey,
                };
                await api.post('/payments', paymentData);
            }

            reset();
            setFiles([]);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} payment`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Payment' : 'Add New Payment'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Payment Number *</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter payment number"
                                {...register('paymentNumber', { required: 'Payment number is required' })}
                            />
                            {errors.paymentNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.paymentNumber.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Amount Paid *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input-field"
                                placeholder="Enter amount paid"
                                {...register('amountPaid', {
                                    required: 'Amount is required',
                                    min: { value: 0, message: 'Amount must be positive' }
                                })}
                            />
                            {errors.amountPaid && (
                                <p className="text-red-500 text-sm mt-1">{errors.amountPaid.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Date Paid</label>
                            <input
                                type="date"
                                className="input-field"
                                {...register('datePaid')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            {isEditMode ? 'Upload New Files (Optional - replaces existing)' : 'Upload Files (Optional)'}
                        </label>
                        <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="input-field"
                        />
                        {files.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">{files.length} file(s) selected</p>
                        )}
                        {isEditMode && payment?.imagesFolderKey && files.length === 0 && (
                            <p className="text-sm text-blue-600 mt-2">Current images will be kept</p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Payment' : 'Create Payment')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-outline"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentFormModal;
