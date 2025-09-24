import Company from '../models/companyModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/company-logos';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Get company details
export const getCompany = async (req, res) => {
    try {
        const company = await Company.getCompany();
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Company details retrieved successfully',
            company: {
                _id: company._id,
                name: company.name,
                address: company.address,
                phone: company.phone,
                logo: company.logo ? `http://localhost:8000/${company.logo.replace(/\\/g, '/')}` : null,
                isActive: company.isActive,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt
            }
        });
    } catch (error) {
        console.error('Error getting company:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update company details
export const updateCompany = async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required and must be at least 2 characters'
            });
        }

        // Prepare update data
        const updateData = {
            name: name.trim(),
            address: address ? address.trim() : '',
            phone: phone ? phone.trim() : '',
            updatedBy: userId
        };

        // Create or update company
        const company = await Company.createOrUpdate(updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Company details updated successfully',
            company: {
                _id: company._id,
                name: company.name,
                address: company.address,
                phone: company.phone,
                logo: company.logo ? `http://localhost:8000/${company.logo.replace(/\\/g, '/')}` : null,
                isActive: company.isActive,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Upload company logo
export const uploadLogo = async (req, res) => {
    try {
        console.log('Upload logo request received:', req.file);
        console.log('User ID:', req.user._id);
        
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user._id;
        const logoPath = req.file.path;
        console.log('Logo path:', logoPath);

        // Get current company
        let company = await Company.getCompany();
        
        if (!company) {
            // If no company exists, create one with default values
            company = await Company.createOrUpdate({
                name: 'My Company',
                address: '',
                phone: '',
                logo: logoPath,
                createdBy: userId
            }, userId);
        } else {
            // Delete old logo if it exists
            if (company.logo && fs.existsSync(company.logo)) {
                fs.unlinkSync(company.logo);
            }

            // Update company with new logo
            company.logo = logoPath;
            company.updatedBy = userId;
            await company.save();
        }

        const logoUrl = `http://localhost:8000/${logoPath.replace(/\\/g, '/')}`;
        console.log('Returning logo URL:', logoUrl);
        
        res.status(200).json({
            success: true,
            message: 'Logo uploaded successfully',
            logo: logoUrl
        });
    } catch (error) {
        console.error('Error uploading logo:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete company logo
export const deleteLogo = async (req, res) => {
    try {
        const userId = req.user._id;
        const company = await Company.getCompany();

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Delete logo file if it exists
        if (company.logo && fs.existsSync(company.logo)) {
            fs.unlinkSync(company.logo);
        }

        // Update company to remove logo
        company.logo = null;
        company.updatedBy = userId;
        await company.save();

        res.status(200).json({
            success: true,
            message: 'Logo deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting logo:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
