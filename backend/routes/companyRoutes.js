import express from 'express';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';
import { hasPermission } from '../Middlewares/hasPermissionMiddleware.js';
import { 
    getCompany, 
    updateCompany, 
    uploadLogo, 
    deleteLogo,
    upload 
} from '../controllers/companyController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Get company details
router.get('/', getCompany);

// Update company details
router.put('/', hasPermission('settings', 'update'), updateCompany);

// Upload company logo
router.post('/logo', hasPermission('settings', 'update'), upload.single('logo'), uploadLogo);

// Delete company logo
router.delete('/logo', hasPermission('settings', 'update'), deleteLogo);

export default router;


