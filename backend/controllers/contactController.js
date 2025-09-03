import Contact from '../models/contactModel.js';
import { hasPermission } from '../helpers/permissionHelper.js';

// Create new contact
export const createContact = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'create')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot create contacts'
            });
        }

        const contactData = {
            ...req.body,
            createdBy: req.user._id
        };

        const contact = new Contact(contactData);
        await contact.save();

        const populatedContact = await Contact.findById(contact._id)
            .populate('assignedTo', 'name email')
            .populate('referral.referrer', 'firstName lastName email');

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
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read contacts'
            });
        }

        const {
            page = 1,
            limit = 20,
            search,
            status,
            leadType,
            source,
            assignedTo,
            tags,
            industry,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (leadType) filter.leadType = leadType;
        if (source) filter.source = source;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (tags) filter.tags = { $in: tags.split(',') };
        if (industry) filter.industry = industry;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const contacts = await Contact.find(filter)
            .populate('assignedTo', 'name email')
            .populate('referral.referrer', 'firstName lastName email')
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
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read contacts'
            });
        }

        const contact = await Contact.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('referral.referrer', 'firstName lastName email')
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
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update contacts'
            });
        }

        const contactData = {
            ...req.body,
            updatedBy: req.user._id
        };

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            contactData,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email')
         .populate('referral.referrer', 'firstName lastName email');

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
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'delete')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot delete contacts'
            });
        }

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

// Add note to contact
export const addNote = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update contacts'
            });
        }

        const { content, type = 'general' } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Note content is required'
            });
        }

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.addNote(content, type, req.user._id);

        res.json({
            success: true,
            message: 'Note added successfully',
            data: contact
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding note',
            error: error.message
        });
    }
};

// Update contact status
export const updateStatus = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update contacts'
            });
        }

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
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read contacts'
            });
        }

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

// Get contacts needing follow-up
export const getContactsNeedingFollowUp = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read contacts'
            });
        }

        const contacts = await Contact.getContactsNeedingFollowUp();

        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts needing follow-up:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts needing follow-up',
            error: error.message
        });
    }
};

// Get referral contacts
export const getReferralContacts = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read contacts'
            });
        }

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
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'import')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot import contacts'
            });
        }

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
                const contact = new Contact({
                    ...contactData,
                    createdBy: req.user._id
                });
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
        // Check permission
        if (!await hasPermission(req.user._id, 'contacts', 'export')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot export contacts'
            });
        }

        const { format = 'json', filters } = req.query;

        // Apply filters if provided
        const filter = { isActive: true };
        if (filters) {
            Object.assign(filter, JSON.parse(filters));
        }

        const contacts = await Contact.find(filter)
            .populate('assignedTo', 'name email')
            .populate('referral.referrer', 'firstName lastName email');

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
        'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title',
        'Status', 'Lead Type', 'Source', 'Industry', 'Assigned To'
    ];

    const csvRows = [headers.join(',')];

    contacts.forEach(contact => {
        const row = [
            contact.firstName || '',
            contact.lastName || '',
            contact.email || '',
            contact.phone || '',
            contact.company || '',
            contact.jobTitle || '',
            contact.status || '',
            contact.leadType || '',
            contact.source || '',
            contact.industry || '',
            contact.assignedTo ? contact.assignedTo.name : ''
        ].map(field => `"${field}"`).join(',');
        
        csvRows.push(row);
    });

    return csvRows.join('\n');
};
