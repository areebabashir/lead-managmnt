# Melnitz AI Sales Assistant - Backend API

A comprehensive CRM and sales productivity platform built with Node.js, Express, and MongoDB.

## 🚀 Features

### Core CRM Functionality
- **Contact Management**: Complete contact lifecycle with extended attributes
- **Lead Tracking**: Advanced lead management with status tracking and conversion
- **Pipeline Management**: Sales pipeline visualization and management
- **Task & Workflow**: Board-based task management with drag-and-drop support

### AI-Powered Features
- **Email Generation**: AI-powered personalized email creation
- **Follow-up Suggestions**: Intelligent follow-up timing recommendations
- **Meeting Summaries**: AI-generated meeting notes and summaries
- **Voice Dictation**: Quick note-taking and email composition

### Workflow & Collaboration
- **Board Management**: Kanban-style boards for tasks and leads
- **Timeline Views**: Gantt chart and timeline visualization
- **Team Collaboration**: Task assignment, comments, and file sharing
- **Automation Rules**: Custom workflows and trigger-based actions

### Analytics & Reporting
- **Dashboard Overview**: Real-time KPI monitoring
- **Pipeline Health**: Sales pipeline performance metrics
- **Performance Analytics**: Individual and team performance tracking
- **Campaign ROI**: Marketing campaign effectiveness analysis

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js with ES6+ modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)

### Project Structure
```
backend/
├── config/           # Configuration files
├── controllers/      # Business logic controllers
├── helpers/         # Utility functions and helpers
├── Middlewares/     # Express middlewares
├── models/          # MongoDB schemas and models
├── routes/          # API route definitions
├── server.js        # Main application entry point
└── README.md        # This file
```

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - User registration
- `POST /signin` - User login
- `POST /signout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### User Management (`/api/users`)
- `GET /` - List all users
- `GET /:id` - Get user details
- `POST /create` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user
- `POST /assign-role` - Assign role to user

### Role Management (`/api/roles`)
- `GET /` - List all roles
- `GET /:id` - Get role details
- `POST /create` - Create new role
- `PUT /:id` - Update role
- `DELETE /:id` - Delete role
- `POST /assign-permissions` - Grant custom permissions

### Contact Management (`/api/contacts`)
- `POST /create` - Create new contact
- `GET /` - List contacts with filtering and pagination
- `GET /:id` - Get contact details
- `PUT /:id` - Update contact
- `DELETE /:id` - Delete contact (soft delete)
- `POST /:id/notes` - Add note to contact
- `PUT /:id/status` - Update contact status
- `GET /status/:status` - Get contacts by status
- `GET /follow-up/needed` - Get contacts needing follow-up
- `GET /referrals/all` - Get referral contacts
- `POST /import` - Import contacts from CSV/Excel
- `GET /export` - Export contacts

### Task Management (`/api/tasks`)
- `POST /create` - Create new task
- `GET /` - List tasks with filtering and pagination
- `GET /:id` - Get task details
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task (soft delete)
- `GET /board/:boardName` - Get tasks by board
- `PUT /:id/move` - Move task between columns
- `POST /:id/comments` - Add comment to task
- `POST /:id/checklist` - Add checklist item
- `PUT /:id/checklist/:itemIndex/complete` - Complete checklist item
- `PUT /:id/status` - Update task status
- `POST /:id/attachments` - Add attachment to task
- `GET /user/:userId?` - Get tasks by user
- `GET /overdue/all` - Get overdue tasks
- `GET /due/today` - Get tasks due today

### Dashboard & Analytics (`/api/dashboard`)
- `GET /overview` - Get dashboard overview data
- `GET /pipeline-health` - Get pipeline health metrics
- `GET /sales-performance` - Get sales performance data
- `GET /campaign-performance` - Get campaign performance metrics

## 🔐 Authentication & Authorization

### JWT Authentication
- Secure token-based authentication
- Configurable token expiration
- Automatic token refresh

### Role-Based Access Control (RBAC)
- **Super Admin**: Full system access
- **Admin**: Administrative functions
- **Manager**: Team oversight capabilities
- **Staff**: Basic operational access

### Permission System
- Resource-based permissions (contacts, tasks, campaigns, etc.)
- Action-based access control (create, read, update, delete, etc.)
- Custom permission overrides for super admins

## 📊 Data Models

### Contact Model
- Basic information (name, company, job title)
- Contact details (email, phone, website, address)
- Lead classification (type, status, priority, source)
- Referral tracking and purchase history
- Interaction history and follow-up scheduling
- Tags, categories, and custom fields

### Task Model
- Task details (title, description, type, priority)
- Board management (board, column, position)
- Timeline and scheduling (due dates, duration)
- Progress tracking (status, checklist, progress)
- Collaboration features (comments, attachments)
- Automation rules and dependencies

### Campaign Model
- Campaign information (name, type, category)
- Target audience and segmentation
- Email templates and AI generation settings
- Performance metrics and ROI tracking
- Team collaboration and automation rules

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd melnitz/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=8000
   MONGO_URI=mongodb://localhost:27017/melnitz
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - The system will automatically create collections and seed default roles

5. **Start the server**
   ```bash
   npm start
   ```

### Default Super Admin
- **Email**: admin@vistabizhub.com
- **Password**: admin123

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 8000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment mode (development/production)

### Database Configuration
- Automatic connection management
- Connection pooling and optimization
- Index creation for performance
- Data validation and sanitization

## 📈 Performance Features

### Database Optimization
- Strategic indexing for common queries
- Aggregation pipelines for complex analytics
- Connection pooling and query optimization

### API Performance
- Pagination for large datasets
- Efficient filtering and sorting
- Response caching strategies
- Rate limiting and throttling

## 🔒 Security Features

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Authentication Security
- Secure password hashing (bcrypt)
- JWT token security
- Session management
- Rate limiting

### Authorization Security
- Role-based access control
- Resource-level permissions
- Audit logging
- Secure API endpoints

## 🧪 Testing

### API Testing
- Comprehensive endpoint testing
- Authentication and authorization testing
- Error handling validation
- Performance testing

### Database Testing
- Schema validation testing
- Query performance testing
- Data integrity testing
- Migration testing

## 📚 API Documentation

### Request/Response Format
All API responses follow a consistent format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

### Error Handling
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Pagination
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🚀 Deployment

### Production Considerations
- Environment-specific configurations
- Database connection optimization
- Logging and monitoring
- Error tracking and alerting
- Performance monitoring
- Security hardening

### Docker Support
- Containerized application
- Multi-stage builds
- Environment-specific configurations
- Easy deployment and scaling

## 🤝 Contributing

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Document new features
- Follow Git commit conventions
- Code review process

### Code Standards
- ES6+ syntax
- Async/await patterns
- Error handling best practices
- Performance optimization
- Security considerations

## 📞 Support

### Documentation
- API reference documentation
- Integration guides
- Troubleshooting guides
- Best practices

### Community
- GitHub issues and discussions
- Developer community forums
- Technical support channels

## 📄 License

This project is licensed under the ISC License.

---

**Melnitz AI Sales Assistant** - Empowering sales teams with intelligent CRM solutions.
