import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; // Importing routes
import roleRoutes from './routes/roleRoutes.js'; // Importing role routes
import userRoutes from './routes/userRoutes.js'; // Importing user routes
import contactRoutes from './routes/contactRoutes.js'; // Importing contact routes
import taskRoutes from './routes/taskRoutes.js'; // Importing task routes
import dashboardRoutes from './routes/dashboardRoutes.js'; // Importing dashboard routes
import aiAssistantRoutes from './routes/aiAssistantRoutes.js'; // Importing AI Assistant routes
import meetingRoutes from './routes/meetingRoutes.js'; // Importing meeting routes
import webhookRoutes from './routes/webhookRoutes.js'; // Importing webhook routes
import emailRoutes from './routes/emailRoutes.js'; // Importing email routes
import meetingNotesRoutes from './routes/meetingNotesRoutes.js'; // Importing meeting notes routes
import { seedDefaultRoles } from './config/seedRoles.js'; // Import role seeder
import emailScheduler from './services/emailScheduler.js'; // Import email scheduler

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to MongoDB
connectDB();

// Seed default roles after database connection
seedDefaultRoles();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/roles', roleRoutes); // Mount role routes
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/contacts', contactRoutes); // Mount contact routes
app.use('/api/tasks', taskRoutes); // Mount task routes
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes
app.use('/api/ai-assistant', aiAssistantRoutes); // Mount AI Assistant routes
app.use('/api/meetings', meetingRoutes); // Mount meeting routes
app.use('/api/webhooks', webhookRoutes); // Mount webhook routes
app.use('/api/emails', emailRoutes); // Mount email routes
app.use('/api/meeting-notes', meetingNotesRoutes); // Mount meeting notes routes

// Basic route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Melnitz AI Sales Assistant</h1>');
});

// Set the PORT from environment variables or default to 8000
const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
  console.log('📧 Email scheduler initialized');
});
