import Contact from '../models/contactModel.js';

// Create new contact
export const createContact = async (req, res) => {
    try {
        // Clean up the data before saving
        const contactData = {
            ...req.body,
            createdBy: req.user._id
        };

        // Handle empty referral referrer field
        if (contactData.referral && contactData.referral.referrer === '') {
            contactData.referral.referrer = undefined;
        }

        // Handle empty referral date field
        if (contactData.referral && contactData.referral.referralDate === '') {
            contactData.referral.referralDate = undefined;
        }

        // Handle empty anniversary field
        if (contactData.anniversary === '') {
            contactData.anniversary = undefined;
        }

        const contact = new Contact(contactData);
        await contact.save();

        const populatedContact = await Contact.findById(contact._id)
            .populate('referral.referrer', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Contact created successfully',
            data: populatedContact
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating contact',
            error: error.message
        });
    }
};

// Get all contacts with filtering and pagination
export const getContacts = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 20,
            search,
            status,
            leadType,
            source,
            tags,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { province: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (leadType) filter.leadType = leadType;
        if (source) filter.source = source;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const contacts = await Contact.find(filter)
            .populate('referral.referrer', 'fullName email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contact.countDocuments(filter);

        res.json({
            success: true,
            data: contacts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts',
            error: error.message
        });
    }
};

// Get single contact by ID
export const getContact = async (req, res) => {
    try {

        const contact = await Contact.findById(req.params.id)
            .populate('referral.referrer', 'fullName email')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact',
            error: error.message
        });
    }
};

// Update contact
export const updateContact = async (req, res) => {
    try {
        // Clean up the data before updating
        const contactData = {
            ...req.body,
            updatedBy: req.user._id
        };

        // Handle empty referral referrer field
        if (contactData.referral && contactData.referral.referrer === '') {
            contactData.referral.referrer = undefined;
        }

        // Handle empty referral date field
        if (contactData.referral && contactData.referral.referralDate === '') {
            contactData.referral.referralDate = undefined;
        }

        // Handle empty anniversary field
        if (contactData.anniversary === '') {
            contactData.anniversary = undefined;
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            contactData,
            { new: true, runValidators: true }
        ).populate('referral.referrer', 'fullName email');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact updated successfully',
            data: contact
        });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact',
            error: error.message
        });
    }
};

// Delete contact (soft delete)
export const deleteContact = async (req, res) => {
    try {

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedBy: req.user._id },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact',
            error: error.message
        });
    }
};

// Update contact status
export const updateStatus = async (req, res) => {
    try {

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.updateStatus(status, req.user._id);

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: contact
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

// Get contacts by status
export const getContactsByStatus = async (req, res) => {
    try {

        const { status } = req.params;
        const contacts = await Contact.getContactsByStatus(status);

        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts by status',
            error: error.message
        });
    }
};

// Get referral contacts
export const getReferralContacts = async (req, res) => {
    try {

        const contacts = await Contact.getReferralContacts();

        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching referral contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching referral contacts',
            error: error.message
        });
    }
};

// Import contacts from CSV/Excel
export const importContacts = async (req, res) => {
    try {

        // This would typically handle file upload and parsing
        // For now, we'll expect the data in req.body
        const { contacts } = req.body;

        if (!contacts || !Array.isArray(contacts)) {
            return res.status(400).json({
                success: false,
                message: 'Contacts data is required and must be an array'
            });
        }

        const importedContacts = [];
        const errors = [];

        for (const contactData of contacts) {
            try {
                // Clean up the data before saving
                const cleanedContactData = {
                    ...contactData,
                    createdBy: req.user._id
                };

                // Handle empty referral referrer field
                if (cleanedContactData.referral && cleanedContactData.referral.referrer === '') {
                    cleanedContactData.referral.referrer = undefined;
                }

                // Handle empty referral date field
                if (cleanedContactData.referral && cleanedContactData.referral.referralDate === '') {
                    cleanedContactData.referral.referralDate = undefined;
                }

                // Handle empty anniversary field
                if (cleanedContactData.anniversary === '') {
                    cleanedContactData.anniversary = undefined;
                }

                const contact = new Contact(cleanedContactData);
                await contact.save();
                importedContacts.push(contact);
            } catch (error) {
                errors.push({
                    data: contactData,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Successfully imported ${importedContacts.length} contacts`,
            data: {
                imported: importedContacts.length,
                errors: errors.length,
                errorDetails: errors
            }
        });
    } catch (error) {
        console.error('Error importing contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error importing contacts',
            error: error.message
        });
    }
};

// Export contacts
export const exportContacts = async (req, res) => {
    try {

        const { format = 'json', filters } = req.query;

        // Apply filters if provided
        const filter = { isActive: true };
        if (filters) {
            Object.assign(filter, JSON.parse(filters));
        }

        const contacts = await Contact.find(filter)
            .populate('referral.referrer', 'fullName email');

        if (format === 'csv') {
            // Convert to CSV format
            const csvData = convertToCSV(contacts);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
            return res.send(csvData);
        }

        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error exporting contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting contacts',
            error: error.message
        });
    }
};

// Helper function to convert contacts to CSV
const convertToCSV = (contacts) => {
    const headers = [
        'Full Name', 'Email', 'Phone Number', 'Street Address', 'City', 'Province', 'Country',
        'Date of Birth', 'Status', 'Anniversary', 'Lead Type', 'Source', 'Last Interaction Date'
    ];

    const csvRows = [headers.join(',')];

    contacts.forEach(contact => {
        const row = [
            contact.fullName || '',
            contact.email || '',
            contact.phoneNumber || '',
            contact.streetAddress || '',
            contact.city || '',
            contact.province || '',
            contact.country || '',
            contact.dateOfBirth ? contact.dateOfBirth.toISOString().split('T')[0] : '',
            contact.status || '',
            contact.anniversary ? contact.anniversary.toISOString().split('T')[0] : '',
            contact.leadType || '',
            contact.source || '',
            contact.lastInteractionDate ? contact.lastInteractionDate.toISOString().split('T')[0] : ''
        ].map(field => `"${field}"`).join(',');
        
        csvRows.push(row);
    });

    return csvRows.join('\n');
};