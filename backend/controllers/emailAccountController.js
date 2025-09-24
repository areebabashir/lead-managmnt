import EmailAccount from '../models/emailAccountModel.js';
import Company from '../models/companyModel.js';

// Get email accounts for company
export const getEmailAccounts = async (req, res) => {
    try {
        const company = await Company.getCompany();
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        const emailAccounts = await EmailAccount.getByCompany(company._id);

        res.status(200).json({
            success: true,
            message: 'Email accounts retrieved successfully',
            emailAccounts: emailAccounts.map(account => ({
                _id: account._id,
                email: account.email,
                displayName: account.displayName,
                settings: account.settings,
                metadata: account.metadata,
                isActive: account.isActive,
                hasGoogleToken: !!(account.google?.refreshToken),
                createdAt: account.createdAt,
                updatedAt: account.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error getting email accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Create new email account
export const createEmailAccount = async (req, res) => {
    try {
        const { email, displayName, google } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (!google || !google.refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Google refresh token is required'
            });
        }

        // Get company
        const company = await Company.getCompany();
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if email account already exists
        const existingAccount = await EmailAccount.findOne({ 
            company: company._id, 
            email: email.toLowerCase() 
        });

        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Email account already exists'
            });
        }

        // Create new email account
        const emailAccount = new EmailAccount({
            company: company._id,
            email: email.toLowerCase(),
            displayName: displayName || '',
            google: {
                refreshToken: google.refreshToken,
                accessToken: google.accessToken || '',
                expiryDate: google.expiryDate ? new Date(google.expiryDate) : null,
                scopes: google.scopes || []
            },
            settings: {
                syncInbox: true,
                syncCalendar: true
            }
        });

        await emailAccount.save();

        res.status(201).json({
            success: true,
            message: 'Email account created successfully',
            emailAccount: {
                _id: emailAccount._id,
                email: emailAccount.email,
                displayName: emailAccount.displayName,
                settings: emailAccount.settings,
                metadata: emailAccount.metadata,
                isActive: emailAccount.isActive,
                createdAt: emailAccount.createdAt,
                updatedAt: emailAccount.updatedAt
            }
        });
    } catch (error) {
        console.error('Error creating email account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update email account
export const updateEmailAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, displayName, settings, google } = req.body;
        const userId = req.user._id;

        const emailAccount = await EmailAccount.findById(id);
        if (!emailAccount) {
            return res.status(404).json({
                success: false,
                message: 'Email account not found'
            });
        }

        // Update fields
        if (email) emailAccount.email = email.toLowerCase();
        if (displayName !== undefined) emailAccount.displayName = displayName;
        if (settings) emailAccount.settings = { ...emailAccount.settings, ...settings };
        if (google) {
            emailAccount.google = { ...emailAccount.google, ...google };
            if (google.expiryDate) {
                emailAccount.google.expiryDate = new Date(google.expiryDate);
            }
        }

        await emailAccount.save();

        res.status(200).json({
            success: true,
            message: 'Email account updated successfully',
            emailAccount: {
                _id: emailAccount._id,
                email: emailAccount.email,
                displayName: emailAccount.displayName,
                settings: emailAccount.settings,
                metadata: emailAccount.metadata,
                isActive: emailAccount.isActive,
                createdAt: emailAccount.createdAt,
                updatedAt: emailAccount.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating email account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete email account
export const deleteEmailAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const emailAccount = await EmailAccount.findById(id);
        if (!emailAccount) {
            return res.status(404).json({
                success: false,
                message: 'Email account not found'
            });
        }

        // Soft delete by setting isActive to false
        emailAccount.isActive = false;
        await emailAccount.save();

        res.status(200).json({
            success: true,
            message: 'Email account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting email account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get active email account
export const getActiveEmailAccount = async (req, res) => {
    try {
        const company = await Company.getCompany();
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        const emailAccount = await EmailAccount.getActiveAccount(company._id);

        if (!emailAccount) {
            return res.status(404).json({
                success: false,
                message: 'No active email account found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Active email account retrieved successfully',
            emailAccount: {
                _id: emailAccount._id,
                email: emailAccount.email,
                displayName: emailAccount.displayName,
                settings: emailAccount.settings,
                metadata: emailAccount.metadata,
                isActive: emailAccount.isActive,
                hasGoogleToken: !!(emailAccount.google?.refreshToken),
                createdAt: emailAccount.createdAt,
                updatedAt: emailAccount.updatedAt
            }
        });
    } catch (error) {
        console.error('Error getting active email account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Activate email account (only one can be active at a time)
export const activateEmailAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Get company
        const company = await Company.getCompany();
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if email account exists
        const emailAccount = await EmailAccount.findById(id);
        if (!emailAccount) {
            return res.status(404).json({
                success: false,
                message: 'Email account not found'
            });
        }

        // Verify the account belongs to the company
        if (emailAccount.company.toString() !== company._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Activate the account (this will deactivate all others)
        console.log(`Activating email account ${id} for company ${company._id}`);
        const activatedAccount = await EmailAccount.activateAccount(id, company._id);
        
        if (!activatedAccount) {
            return res.status(500).json({
                success: false,
                message: 'Failed to activate email account'
            });
        }

        console.log(`Successfully activated email account: ${activatedAccount.email}`);

        res.status(200).json({
            success: true,
            message: 'Email account activated successfully',
            emailAccount: {
                _id: activatedAccount._id,
                email: activatedAccount.email,
                displayName: activatedAccount.displayName,
                settings: activatedAccount.settings,
                metadata: activatedAccount.metadata,
                isActive: activatedAccount.isActive,
                hasGoogleToken: !!(activatedAccount.google?.refreshToken),
                createdAt: activatedAccount.createdAt,
                updatedAt: activatedAccount.updatedAt
            }
        });
    } catch (error) {
        console.error('Error activating email account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
