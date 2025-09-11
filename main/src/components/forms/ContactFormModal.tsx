import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Contact, CreateContactData } from '../../services/contactAPI';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContactData) => void;
  contact?: Contact | null;
  title: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
  title
}) => {
  const [formData, setFormData] = useState<CreateContactData>({
    email: '',
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    province: '',
    country: '',
    dateOfBirth: '',
    status: 'New',
    anniversary: '',
    leadType: '',
    referral: {
      isReferral: false,
      referrer: '',
      referralDate: '',
      referralNotes: ''
    },
    priceRange: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    searchArea: '',
    source: 'website'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact) {
      setFormData({
        email: contact.email,
        fullName: contact.fullName,
        phoneNumber: contact.phoneNumber,
        streetAddress: contact.streetAddress,
        city: contact.city,
        province: contact.province,
        country: contact.country,
        dateOfBirth: contact.dateOfBirth.split('T')[0],
        status: contact.status,
        anniversary: contact.anniversary ? contact.anniversary.split('T')[0] : '',
        leadType: contact.leadType || '',
        referral: contact.referral || {
          isReferral: false,
          referrer: '',
          referralDate: '',
          referralNotes: ''
        },
        priceRange: contact.priceRange || {
          min: 0,
          max: 0,
          currency: 'USD'
        },
        searchArea: contact.searchArea || '',
        source: contact.source
      });
    } else {
      // Reset form for new contact
      setFormData({
        email: '',
        fullName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        province: '',
        country: '',
        dateOfBirth: '',
        status: 'New',
        anniversary: '',
        leadType: '',
        referral: {
          isReferral: false,
          referrer: '',
          referralDate: '',
          referralNotes: ''
        },
        priceRange: {
          min: 0,
          max: 0,
          currency: 'USD'
        },
        searchArea: '',
        source: 'website'
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    // Date validation
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    if (formData.anniversary && new Date(formData.anniversary) > new Date()) {
      newErrors.anniversary = 'Anniversary date cannot be in the future';
    }

    // Price range validation
    if (formData.priceRange && formData.priceRange.min > formData.priceRange.max) {
      newErrors.priceRange = 'Minimum price cannot be greater than maximum price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Clean up the data before submitting
      const cleanedData = { ...formData };
      
      // Convert empty strings to undefined for optional fields
      if (cleanedData.anniversary === '') cleanedData.anniversary = undefined;
      if (cleanedData.leadType === '') cleanedData.leadType = undefined;
      if (cleanedData.searchArea === '') cleanedData.searchArea = undefined;
      
      // Handle referral fields
      if (cleanedData.referral) {
        if (cleanedData.referral.referrer === '') cleanedData.referral.referrer = undefined;
        if (cleanedData.referral.referralDate === '') cleanedData.referral.referralDate = undefined;
        if (cleanedData.referral.referralNotes === '') cleanedData.referral.referralNotes = undefined;
      }
      
      // Handle price range
      if (cleanedData.priceRange) {
        if (cleanedData.priceRange.min === 0 && cleanedData.priceRange.max === 0) {
          cleanedData.priceRange = undefined;
        }
      }
      
      onSubmit(cleanedData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof CreateContactData] as any,
        [childField]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Fields Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Information</h3>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            {/* Address Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Address Information</h3>
            </div>

            {/* Street Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter street address"
              />
              {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province *
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.province ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter province"
              />
              {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
            </div>

            {/* Country */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter country"
              />
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
            </div>

            {/* Optional Fields Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Optional Information</h3>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'New' | 'Existing' | 'First-Time Buyer')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
              >
                <option value="New">New</option>
                <option value="Existing">Existing</option>
                <option value="First-Time Buyer">First-Time Buyer</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_call">Cold Call</option>
                <option value="social_media">Social Media</option>
                <option value="advertising">Advertising</option>
                <option value="event">Event</option>
                <option value="facebook">Facebook</option>
                <option value="zapier">Zapier</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Lead Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Type
              </label>
              <input
                type="text"
                value={formData.leadType}
                onChange={(e) => handleInputChange('leadType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                placeholder="e.g., Real Estate, Insurance, etc."
              />
            </div>

            {/* Anniversary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anniversary
              </label>
              <input
                type="date"
                value={formData.anniversary}
                onChange={(e) => handleInputChange('anniversary', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-100 outline-none ${
                  errors.anniversary ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.anniversary && <p className="text-red-500 text-xs mt-1">{errors.anniversary}</p>}
            </div>

            {/* Search Area */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Area
              </label>
              <input
                type="text"
                value={formData.searchArea}
                onChange={(e) => handleInputChange('searchArea', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                placeholder="Geographic area of interest"
              />
            </div>

            {/* Price Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.priceRange?.min || ''}
                    onChange={(e) => handleNestedInputChange('priceRange', 'min', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                    placeholder="Min Price"
                    min="0"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.priceRange?.max || ''}
                    onChange={(e) => handleNestedInputChange('priceRange', 'max', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                    placeholder="Max Price"
                    min="0"
                  />
                </div>
                <div>
                  <select
                    value={formData.priceRange?.currency || 'USD'}
                    onChange={(e) => handleNestedInputChange('priceRange', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              {errors.priceRange && <p className="text-red-500 text-xs mt-1">{errors.priceRange}</p>}
            </div>

            {/* Referral Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Referral Information</h3>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.referral?.isReferral || false}
                  onChange={(e) => handleNestedInputChange('referral', 'isReferral', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Is this a referral?</span>
              </label>
            </div>

            {formData.referral?.isReferral && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referrer ID
                  </label>
                  <input
                    type="text"
                    value={formData.referral?.referrer || ''}
                    onChange={(e) => handleNestedInputChange('referral', 'referrer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                    placeholder="Referrer contact ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Date
                  </label>
                  <input
                    type="date"
                    value={formData.referral?.referralDate || ''}
                    onChange={(e) => handleNestedInputChange('referral', 'referralDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Notes
                  </label>
                  <textarea
                    value={formData.referral?.referralNotes || ''}
                    onChange={(e) => handleNestedInputChange('referral', 'referralNotes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-100 outline-none"
                    rows={3}
                    placeholder="Additional referral information"
                  />
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              {contact ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
