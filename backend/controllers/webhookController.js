import Contact from '../models/contactModel.js';
import User from '../models/authModel.js';

// Webhook endpoint for Zapier to send Facebook leads
export const receiveFacebookLead = async (req, res) => {
    try {
        console.log('Received Facebook lead from Zapier:', req.body);
        
        const {
            // Facebook Lead Ads data
            lead_id,
            ad_id,
            form_id,
            page_id,
            created_time,
            
            // Lead information
            first_name,
            last_name,
            email,
            phone_number,
            full_name,
            
            // Additional fields that might come from Facebook
            company_name,
            job_title,
            city,
            state,
            zip_code,
            country,
            
            // Custom fields
            custom_fields = {},
            
            // Zapier metadata
            zapier_webhook_id,
            
            // Lead source details
            campaign_name,
            adset_name,
            ad_name,
            form_name
        } = req.body;

        // Validate required fields
        if (!email && !phone_number) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required'
            });
        }

        // Check if lead already exists (by email or phone)
        const existingLead = await Contact.findOne({
            $or: [
                { email: email?.toLowerCase() },
                { phone: phone_number }
            ],
            facebookLeadId: lead_id
        });

        if (existingLead) {
            console.log('Lead already exists:', existingLead._id);
            return res.status(200).json({
                success: true,
                message: 'Lead already exists',
                leadId: existingLead._id
            });
        }

        // Get a default user to assign the lead to (you might want to modify this logic)
        const defaultUser = await User.findOne({ isSuperAdmin: true });
        if (!defaultUser) {
            return res.status(500).json({
                success: false,
                message: 'No default user found to assign lead'
            });
        }

        // Parse name if full_name is provided but first_name/last_name are not
        let firstName = first_name;
        let lastName = last_name;
        
        if (!firstName && !lastName && full_name) {
            const nameParts = full_name.trim().split(' ');
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ') || '';
        }

        // Create new contact
        const newContact = new Contact({
            firstName: firstName || 'Unknown',
            lastName: lastName || '',
            email: email?.toLowerCase() || '',
            phone: phone_number || '',
            company: company_name || '',
            jobTitle: job_title || '',
            
            // Address information
            address: {
                city: city || '',
                state: state || '',
                zipCode: zip_code || '',
                country: country || ''
            },
            
            // Facebook Lead Ads specific data
            facebookLeadId: lead_id,
            facebookAdId: ad_id,
            facebookFormId: form_id,
            facebookPageId: page_id,
            
            // Zapier integration
            zapierWebhookId: zapier_webhook_id,
            
            // Lead source details
            source: 'facebook',
            leadSourceDetails: {
                platform: 'facebook',
                campaign: campaign_name || '',
                adSet: adset_name || '',
                ad: ad_name || '',
                form: form_name || ''
            },
            
            // Default values
            status: 'prospect',
            priority: 'medium',
            leadType: 'new',
            
            // Assignment
            assignedTo: defaultUser._id,
            assignedBy: defaultUser._id,
            
            // System fields
            createdBy: defaultUser._id,
            isActive: true,
            
            // Add custom fields as notes
            notes: custom_fields && Object.keys(custom_fields).length > 0 ? [{
                content: `Custom fields from Facebook: ${JSON.stringify(custom_fields)}`,
                type: 'general',
                createdBy: defaultUser._id
            }] : []
        });

        // Add a note about the lead source
        newContact.notes.push({
            content: `Lead received from Facebook Lead Ads via Zapier. Lead ID: ${lead_id}`,
            type: 'general',
            createdBy: defaultUser._id
        });

        await newContact.save();

        console.log('Successfully created new Facebook lead:', newContact._id);

        res.status(201).json({
            success: true,
            message: 'Facebook lead created successfully',
            leadId: newContact._id,
            contact: {
                id: newContact._id,
                name: `${newContact.firstName} ${newContact.lastName}`,
                email: newContact.email,
                phone: newContact.phone,
                source: newContact.source
            }
        });

    } catch (error) {
        console.error('Error processing Facebook lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing Facebook lead',
            error: error.message
        });
    }
};

// Webhook endpoint for general Zapier leads (not just Facebook)
export const receiveZapierLead = async (req, res) => {
    try {
        console.log('Received lead from Zapier:', req.body);
        
        const {
            // Basic contact information
            first_name,
            last_name,
            email,
            phone,
            company,
            job_title,
            
            // Address
            address,
            city,
            state,
            zip_code,
            country,
            
            // Lead details
            lead_source,
            campaign,
            notes: lead_notes,
            
            // Zapier metadata
            zapier_webhook_id,
            source_platform
        } = req.body;

        // Validate required fields
        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone is required'
            });
        }

        // Check if lead already exists
        const existingLead = await Contact.findOne({
            $or: [
                { email: email?.toLowerCase() },
                { phone: phone }
            ],
            zapierWebhookId: zapier_webhook_id
        });

        if (existingLead) {
            return res.status(200).json({
                success: true,
                message: 'Lead already exists',
                leadId: existingLead._id
            });
        }

        // Get default user
        const defaultUser = await User.findOne({ isSuperAdmin: true });
        if (!defaultUser) {
            return res.status(500).json({
                success: false,
                message: 'No default user found to assign lead'
            });
        }

        // Create new contact
        const newContact = new Contact({
            firstName: first_name || 'Unknown',
            lastName: last_name || '',
            email: email?.toLowerCase() || '',
            phone: phone || '',
            company: company || '',
            jobTitle: job_title || '',
            
            // Address
            address: {
                street: address || '',
                city: city || '',
                state: state || '',
                zipCode: zip_code || '',
                country: country || ''
            },
            
            // Lead source
            source: lead_source || 'zapier',
            zapierWebhookId: zapier_webhook_id,
            leadSourceDetails: {
                platform: source_platform || 'zapier',
                campaign: campaign || ''
            },
            
            // Default values
            status: 'prospect',
            priority: 'medium',
            leadType: 'new',
            
            // Assignment
            assignedTo: defaultUser._id,
            assignedBy: defaultUser._id,
            createdBy: defaultUser._id,
            isActive: true,
            
            // Notes
            notes: lead_notes ? [{
                content: lead_notes,
                type: 'general',
                createdBy: defaultUser._id
            }] : []
        });

        // Add source note
        newContact.notes.push({
            content: `Lead received via Zapier webhook. Webhook ID: ${zapier_webhook_id}`,
            type: 'general',
            createdBy: defaultUser._id
        });

        await newContact.save();

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            leadId: newContact._id,
            contact: {
                id: newContact._id,
                name: `${newContact.firstName} ${newContact.lastName}`,
                email: newContact.email,
                phone: newContact.phone,
                source: newContact.source
            }
        });

    } catch (error) {
        console.error('Error processing Zapier lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing lead',
            error: error.message
        });
    }
};

// Test webhook endpoint
export const testWebhook = async (req, res) => {
    res.json({
        success: true,
        message: 'Webhook endpoint is working',
        timestamp: new Date().toISOString(),
        receivedData: req.body
    });
};
