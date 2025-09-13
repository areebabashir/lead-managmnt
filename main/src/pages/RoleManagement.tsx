import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search,
  Check,
  X,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { userAPI, Role } from '../services/userAPI';
import { useAuth } from '../contexts/AuthContext';

interface Permission {
  resource: string;
  actions: string[];
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: Permission[];
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<{ permissions: any[]; permissionsByResource: any }>({ permissions: [], permissionsByResource: {} });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPermissions, setShowPermissions] = useState<{ [key: string]: boolean }>({});

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchRoles();
    fetchAvailablePermissions();
  }, []);

  // Transform form permissions to Permission IDs
  const transformPermissionsToIds = (permissions: Permission[]): string[] => {
    const permissionIds: string[] = [];
    
    permissions.forEach(permission => {
      if (availablePermissions.permissionsByResource[permission.resource]) {
        availablePermissions.permissionsByResource[permission.resource].forEach((perm: any) => {
          if (permission.actions.includes(perm.action)) {
            permissionIds.push(perm._id);
          }
        });
      }
    });
    
    return permissionIds;
  };

  // Transform role permissions from backend format to form format
  const transformRolePermissionsToForm = (rolePermissions: any[]): Permission[] => {
    const formPermissions: { [resource: string]: string[] } = {};
    
    rolePermissions.forEach((perm: any) => {
      if (!formPermissions[perm.resource]) {
        formPermissions[perm.resource] = [];
      }
      formPermissions[perm.resource].push(perm.action);
    });
    
    return Object.entries(formPermissions).map(([resource, actions]) => ({
      resource,
      actions
    }));
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllRoles();
      if (response.success) {
        setRoles(response.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      const response = await userAPI.getAvailablePermissions();
      console.log("response", response)
      if (response.success) {
        setAvailablePermissions({
          permissions: response.permissions || [],
          permissionsByResource: response.permissionsByResource || {}
        });
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      // Transform permissions to IDs
      const permissionIds = transformPermissionsToIds(formData.permissions);
      
      const roleData = {
        name: formData.name,
        description: formData.description,
        permissions: permissionIds
      };
      
      const response = await userAPI.createRole(roleData);
      if (response.success) {
        setSuccess('Role created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchRoles();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create role');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      setError('');
      
      // Transform permissions to IDs
      const permissionIds = transformPermissionsToIds(formData.permissions);
      
      const roleData = {
        name: formData.name,
        description: formData.description,
        permissions: permissionIds
      };
      
      const response = await userAPI.updateRole(editingRole._id, roleData);
      if (response.success) {
        setSuccess('Role updated successfully');
        setShowEditModal(false);
        setEditingRole(null);
        resetForm();
        fetchRoles();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      setError('');
      const response = await userAPI.deleteRole(roleId);
      if (response.success) {
        setSuccess('Role deleted successfully');
        fetchRoles();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete role');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    
    // Transform role permissions to form format
    const formPermissions = transformRolePermissionsToForm(role.permissions || []);
    
    setFormData({
      name: role.name,
      description: role.description,
      permissions: formPermissions
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setError('');
    setSuccess('');
  };

  const addPermission = () => {
    setFormData({
      ...formData,
      permissions: [...formData.permissions, { resource: '', actions: [] }]
    });
  };

  const removePermission = (index: number) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.filter((_, i) => i !== index)
    });
  };

  const updatePermission = (index: number, field: 'resource' | 'actions', value: string | string[]) => {
    const newPermissions = [...formData.permissions];
    newPermissions[index] = { ...newPermissions[index], [field]: value };
    setFormData({ ...formData, permissions: newPermissions });
  };

  const toggleAction = (permissionIndex: number, action: string) => {
    const permission = formData.permissions[permissionIndex];
    const newActions = permission.actions.includes(action)
      ? permission.actions.filter(a => a !== action)
      : [...permission.actions, action];
    updatePermission(permissionIndex, 'actions', newActions);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin':
        return 'bg-red-100 text-red-800';
      case 'Sales Director':
        return 'bg-blue-100 text-blue-800';
      case 'Sales Manager':
        return 'bg-green-100 text-green-800';
      case 'Sales Representative':
        return 'bg-yellow-100 text-yellow-800';
      case 'Marketing Specialist':
        return 'bg-purple-100 text-purple-800';
      case 'Customer Success Manager':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage roles and permissions</p>
        </div>
        {hasPermission('roles', 'create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Role
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resources</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(availablePermissions.permissionsByResource || {}).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <motion.div
            key={role._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasPermission('roles', 'update') && role.name !== 'Super Admin' && (
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                {hasPermission('roles', 'delete') && role.name !== 'Super Admin' && (
                  <button
                    onClick={() => handleDeleteRole(role._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Permissions</span>
                <button
                  onClick={() => setShowPermissions(prev => ({ ...prev, [role._id]: !prev[role._id] }))}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  {showPermissions[role._id] ? (
                    <>
                      <EyeOff className="h-4 w-4 inline mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 inline mr-1" />
                      Show
                    </>
                  )}
                </button>
              </div>

              {showPermissions[role._id] && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {role.permissions && role.permissions.length > 0 ? (
                    (() => {
                      // Group permissions by resource
                      const groupedPermissions = role.permissions.reduce((acc: { [key: string]: string[] }, permission: any) => {
                        if (permission.resource) {
                          if (!acc[permission.resource]) {
                            acc[permission.resource] = [];
                          }
                          acc[permission.resource].push(permission.action);
                        }
                        return acc;
                      }, {});

                      return Object.entries(groupedPermissions).map(([resource, actions]) => (
                        <div key={resource} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-sm text-gray-900 capitalize">
                            {resource}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {actions.map((action) => (
                              <span
                                key={action}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="text-sm text-gray-500 italic">No permissions assigned</div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Created</span>
                  <span>{new Date(role.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Role</h2>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Permissions</label>
                  <button
                    type="button"
                    onClick={addPermission}
                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Permission
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.permissions.map((permission, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Permission {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePermission(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                          <select
                            value={permission.resource}
                            onChange={(e) => updatePermission(index, 'resource', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">Select Resource</option>
                            {Object.keys(availablePermissions.permissionsByResource || {}).map(resource => (
                              <option key={resource} value={resource}>{resource}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                          <div className="flex flex-wrap gap-2">
                            {(availablePermissions.permissionsByResource[permission.resource] || []).map((perm: any) => (
                              <button
                                key={perm.action}
                                type="button"
                                onClick={() => toggleAction(index, perm.action)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  permission.actions.includes(perm.action)
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {perm.action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Create Role
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Role</h2>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Permissions</label>
                  <button
                    type="button"
                    onClick={addPermission}
                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Permission
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.permissions.map((permission, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Permission {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePermission(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                          <select
                            value={permission.resource}
                            onChange={(e) => updatePermission(index, 'resource', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">Select Resource</option>
                            {Object.keys(availablePermissions.permissionsByResource || {}).map(resource => (
                              <option key={resource} value={resource}>{resource}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                          <div className="flex flex-wrap gap-2">
                            {(availablePermissions.permissionsByResource[permission.resource] || []).map((perm: any) => (
                              <button
                                key={perm.action}
                                type="button"
                                onClick={() => toggleAction(index, perm.action)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  permission.actions.includes(perm.action)
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {perm.action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRole(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Update Role
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
