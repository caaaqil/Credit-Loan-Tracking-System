import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            registerDate: new Date().toISOString().split('T')[0],
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        try {
            await api.post('/customers', data);
            navigate('/customers');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="page-title">Add New Customer</h1>

            <div className="card">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Customer Name *</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter customer name"
                                {...register('name', { required: 'Customer name is required' })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Phone Number *</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="Enter phone number"
                                {...register('phone', { required: 'Phone number is required' })}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Village/Place *</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter village or place"
                                {...register('village', { required: 'Village/place is required' })}
                            />
                            {errors.village && (
                                <p className="text-red-500 text-sm mt-1">{errors.village.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Category *</label>
                            <select
                                className="input-field"
                                {...register('category', { required: 'Category is required' })}
                            >
                                <option value="">Select category</option>
                                <option value="Regular">Regular</option>
                                <option value="VIP">VIP</option>
                                <option value="Wholesale">Wholesale</option>
                                <option value="Retail">Retail</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.category && (
                                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Register Date</label>
                            <input
                                type="date"
                                className="input-field"
                                {...register('registerDate')}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Customer'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/customers')}
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

export default AddCustomer;
