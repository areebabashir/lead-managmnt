import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { userAPI, User, Role } from '../services/userAPI';
import { useAuth } from '../contexts/AuthContext';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  roleId: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    roleId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await userAPI.getAllRoles();
      if (response.success) {
        setRoles(response.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const response = await userAPI.createUser(formData);
      if (response.success) {
        setSuccess('User created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setError('');
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        roleId: formData.roleId,
        ...(formData.password && { password: formData.password })
      };

      const response = await userAPI.updateUser(editingUser._id, updateData);
      if (response.success) {
        setSuccess('User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
        resetForm();
        fetchUsers();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setError('');
      const response = await userAPI.deleteUser(userId);
      if (response.success) {
        setSuccess('User deleted successfully');
        fetchUsers();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone,
      address: user.address,
      roleId: user.role?._id || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      roleId: ''
    });
    setError('');
    setSuccess('');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || 
                       (selectedRole === 'no-role' && !user.role) ||
                       user.role?._id === selectedRole;
    return matchesSearch && matchesRole;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users and their roles</p>
        </div>
        {hasPermission('users', 'create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Add User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(user => user.role?.name === 'Super Admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="no-role">No Role Assigned</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {user.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {user.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.role?.name === 'Super Admin' 
                        ? 'bg-red-100 text-red-800'
                        : user.role?.name === 'Sales Director'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <Shield className="h-4 w-4 mr-1" />
                      {user.role?.name || 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('users', 'update') && (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('users', 'delete') && user.email !== 'admin@melnitz.com' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">No Role (Optional)</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
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
                  Create User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">No Role (Optional)</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
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
                    setEditingUser(null);
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
                  Update User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

              <tr>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200">

              {filteredUsers.map((user) => (

                <motion.tr

                  key={user._id}

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  className="hover:bg-gray-50 transition-colors"

                >

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">

                        <span className="text-orange-600 font-semibold text-sm">

                          {user.name.charAt(0).toUpperCase()}

                        </span>

                      </div>

                      <div>

                        <p className="font-medium text-gray-900">{user.name}</p>

                        <p className="text-sm text-gray-500">{user.email}</p>

                      </div>

                    </div>

                  </td>

                  <td className="px-6 py-4">

                    <div className="space-y-1">

                      <div className="flex items-center gap-2 text-sm text-gray-600">

                        <Phone className="h-4 w-4" />

                        {user.phone}

                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">

                        <MapPin className="h-4 w-4" />

                        {user.address}

                      </div>

                    </div>

                  </td>

                  <td className="px-6 py-4">

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${

                      user.role?.name === 'Super Admin' 

                        ? 'bg-red-100 text-red-800'

                        : user.role?.name === 'Sales Director'

                        ? 'bg-blue-100 text-blue-800'

                        : 'bg-gray-100 text-gray-800'

                    }`}>

                      <Shield className="h-4 w-4 mr-1" />

                      {user.role?.name || 'No Role'}

                    </span>

                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">

                    {new Date(user.createdAt).toLocaleDateString()}

                  </td>

                  <td className="px-6 py-4 text-right">

                    <div className="flex items-center justify-end gap-2">

                      {hasPermission('users', 'update') && (

                        <button

                          onClick={() => handleEditUser(user)}

                          className="p-2 text-gray-400 hover:text-orange-600 transition-colors"

                        >

                          <Edit className="h-4 w-4" />

                        </button>

                      )}

                      {hasPermission('users', 'delete') && user.email !== 'admin@melnitz.com' && (

                        <button

                          onClick={() => handleDeleteUser(user._id)}

                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"

                        >

                          <Trash2 className="h-4 w-4" />

                        </button>

                      )}

                    </div>

                  </td>

                </motion.tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>



      {/* Create User Modal */}

      {showCreateModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <motion.div

            initial={{ opacity: 0, scale: 0.95 }}

            animate={{ opacity: 1, scale: 1 }}

            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"

          >

            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>

                <input

                  type="text"

                  required

                  value={formData.name}

                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

                <input

                  type="email"

                  required

                  value={formData.email}

                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>

                <input

                  type="password"

                  required

                  value={formData.password}

                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>

                <input

                  type="tel"

                  required

                  value={formData.phone}

                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>

                <input

                  type="text"

                  required

                  value={formData.address}

                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>

                <select

                  value={formData.roleId}

                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                >

                  <option value="">No Role (Optional)</option>

                  {roles.map(role => (

                    <option key={role._id} value={role._id}>{role.name}</option>

                  ))}

                </select>

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

                  Create User

                </button>

              </div>

            </form>

          </motion.div>

        </div>

      )}



      {/* Edit User Modal */}

      {showEditModal && editingUser && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <motion.div

            initial={{ opacity: 0, scale: 0.95 }}

            animate={{ opacity: 1, scale: 1 }}

            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"

          >

            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User</h2>

            <form onSubmit={handleUpdateUser} className="space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>

                <input

                  type="text"

                  required

                  value={formData.name}

                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

                <input

                  type="email"

                  required

                  value={formData.email}

                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>

                <input

                  type="password"

                  value={formData.password}

                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>

                <input

                  type="tel"

                  required

                  value={formData.phone}

                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>

                <input

                  type="text"

                  required

                  value={formData.address}

                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>

                <select

                  value={formData.roleId}

                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                >

                  <option value="">No Role (Optional)</option>

                  {roles.map(role => (

                    <option key={role._id} value={role._id}>{role.name}</option>

                  ))}

                </select>

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

                    setEditingUser(null);

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

                  Update User

                </button>

              </div>

            </form>

          </motion.div>

        </div>

      )}

    </div>

  );

};



export default UserManagement;


