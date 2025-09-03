# Role-Based Authentication System

This document explains the comprehensive role-based authentication system implemented in the Vista Biz Hub application.

## Overview

The system implements a flexible, hierarchical permission system where:
- **Super Admin** has full system access and can override any permissions
- **Roles** define standard permission sets for groups of users
- **Custom Permissions** allow Super Admin to grant additional permissions beyond role limits
- **Resource-based Access Control** ensures users can only access what they're authorized to

## System Architecture

### 1. Models

#### User Model (`authModel.js`)
- `role`: Reference to Role model
- `isSuperAdmin`: Boolean flag for super admin status
- `isActive`: Boolean flag for user status

#### Role Model (`roleModel.js`)
- `name`: Role name (e.g., "Admin", "Manager", "Staff")
- `description`: Role description
- `permissions`: Array of resource-action permissions
- `isSystem`: Boolean flag for system roles (cannot be deleted)
- `isActive`: Boolean flag for role status

#### UserPermission Model (`userPermissionModel.js`)
- `userId`: Reference to User
- `resource`: Resource name (e.g., "users", "leads", "tickets")
- `actions`: Array of allowed actions (e.g., ["create", "read", "update"])
- `grantedBy`: Reference to User who granted the permission
- `expiresAt`: Optional expiration date
- `isActive`: Boolean flag for permission status

### 2. Permission Structure

#### Resources
- `users`: User management
- `roles`: Role management
- `leads`: Lead management
- `tickets`: Support tickets
- `tasks`: Task management
- `articles`: Knowledge base articles
- `settings`: System settings
- `reports`: System reports

#### Actions
- `create`: Create new items
- `read`: View items
- `update`: Modify existing items
- `delete`: Remove items
- `approve`: Approve items
- `assign`: Assign items to others
- `export`: Export data

### 3. Default Roles

#### Super Admin
- **Full access** to all resources and actions
- Can create, modify, and delete roles
- Can assign custom permissions to any user
- Cannot be deleted or demoted

#### Admin
- **Most administrative** functions
- User management (read, update, assign)
- Full access to business operations
- Cannot modify system roles

#### Manager
- **Team oversight** capabilities
- Lead, ticket, and task management
- Article creation and approval
- Basic reporting access

#### Staff
- **Basic operational** access
- Read access to leads and tickets
- Task updates
- Article reading

## API Endpoints

### Role Management (`/api/roles`)
- `POST /create` - Create new role (Super Admin only)
- `GET /` - List all roles (Admin+)
- `GET /:id` - Get role details (Admin+)
- `PUT /:id` - Update role (Super Admin only)
- `DELETE /:id` - Delete role (Super Admin only)

### Custom Permissions (`/api/roles`)
- `POST /assign-permissions` - Grant custom permissions (Super Admin only)
- `DELETE /permissions/:userId/:resource` - Remove custom permissions (Super Admin only)
- `GET /user/:userId/permissions` - Get user permissions (Admin+)

### User Management (`/api/users`)
- `POST /create` - Create new user (Super Admin only)
- `GET /` - List all users (Admin+)
- `GET /:id` - Get user details (Admin+)
- `PUT /:id` - Update user (Super Admin only)
- `DELETE /:id` - Delete user (Super Admin only)
- `POST /assign-role` - Assign role to user (Super Admin only)
- `PUT /:userId/toggle-super-admin` - Toggle super admin status (Super Admin only)

## Middleware

### Authentication Middleware
- `requireSignIn`: Verifies JWT token
- `isAdmin`: Checks admin access
- `requireSuperAdmin`: Ensures super admin access
- `requireAdmin`: Ensures admin or super admin access

### Permission Middleware
- `checkPermission(resource, action)`: Checks specific permission
- `checkResourceAccess(resource)`: Checks resource access

## Usage Examples

### 1. Protecting Routes with Permissions

```javascript
// Require specific permission
router.post('/leads', 
    requireSignIn, 
    checkPermission('leads', 'create'), 
    createLeadController
);

// Require resource access
router.get('/tickets', 
    requireSignIn, 
    checkResourceAccess('tickets'), 
    getTicketsController
);
```

### 2. Checking Permissions in Controllers

```javascript
import { hasPermission } from '../helpers/permissionHelper.js';

export const someController = async (req, res) => {
    const canDelete = await hasPermission(req.user._id, 'leads', 'delete');
    
    if (!canDelete) {
        return res.status(403).json({
            success: false,
            message: "Permission denied"
        });
    }
    
    // Proceed with operation
};
```

### 3. Assigning Custom Permissions

```javascript
// Super Admin can grant additional permissions
const customPermission = {
    userId: "user_id_here",
    resource: "reports",
    actions: ["read", "export"],
    expiresAt: "2024-12-31" // Optional expiration
};

await UserPermission.create(customPermission);
```

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Role Validation**: Server-side role verification
3. **Permission Inheritance**: Users inherit role permissions
4. **Custom Permission Override**: Super admin can grant additional access
5. **Expiration Support**: Custom permissions can have time limits
6. **Audit Trail**: All permission changes are tracked

## Database Seeding

The system automatically creates default roles and a super admin user on first run:

- **Default Roles**: Super Admin, Admin, Manager, Staff
- **Super Admin User**: admin@vistabizhub.com / admin123
- **System Roles**: Cannot be deleted or modified

## Best Practices

1. **Always check permissions** before performing operations
2. **Use middleware** for route protection
3. **Validate permissions** at both frontend and backend
4. **Log permission changes** for audit purposes
5. **Regular permission reviews** to ensure security
6. **Principle of least privilege** - grant minimum required access

## Migration Notes

If upgrading from the old system:
1. Existing users will be assigned the "Staff" role by default
2. Old role numbers (0, 1) are replaced with role references
3. Super admin status can be toggled via API
4. Custom permissions can be assigned to existing users

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check user role and custom permissions
2. **Role Not Found**: Ensure role exists and is active
3. **Middleware Errors**: Verify JWT token and user existence
4. **Database Errors**: Check MongoDB connection and models

### Debug Commands

```javascript
// Check user permissions
const permissions = await getUserAllPermissions(userId);
console.log(permissions);

// Verify role assignment
const user = await User.findById(userId).populate('role');
console.log(user.role);
```

## Support

For technical support or questions about the role system, please refer to the system documentation or contact the development team.
