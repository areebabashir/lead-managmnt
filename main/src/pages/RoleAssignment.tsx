import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  UserCheck, 
  ArrowRight,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Save,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { userAPI, User, Role } from '../services/userAPI';
import { useAuth } from '../contexts/AuthContext';

interface RoleAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  currentRoleId: string | null;
  currentRoleName: string | null;
  newRoleId: string | null;
  newRoleName: string | null;
}

const RoleAssignment: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [pendingChanges, setPendingChanges] = useState<{ [userId: string]: string }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([
        userAPI.getAllUsers(),
        userAPI.getAllRoles()
      ]);

      if (usersResponse.success && rolesResponse.success) {
        setUsers(usersResponse.users);
        setRoles(rolesResponse.roles);
        
        // Initialize assignments
        const initialAssignments: RoleAssignment[] = usersResponse.users.map(user => ({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          currentRoleId: user.role?._id || null,
          currentRoleName: user.role?.name || null,
          newRoleId: user.role?._id || null,
          newRoleName: user.role?.name || null
        }));
        setAssignments(initialAssignments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRoleId: string) => {
    const newRole = roles.find(role => role._id === newRoleId);
    const newRoleName = newRole ? newRole.name : null;

    // Update assignments
    setAssignments(prev => prev.map(assignment => 
      assignment.userId === userId 
        ? { ...assignment, newRoleId, newRoleName }
        : assignment
    ));

    // Track pending changes
    setPendingChanges(prev => ({
      ...prev,
      [userId]: newRoleId
    }));
  };

  const saveAllChanges = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const changes = Object.entries(pendingChanges);
      const results = await Promise.allSettled(
        changes.map(([userId, roleId]) => 
          userAPI.assignRole(userId, roleId)
        )
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        setSuccess(`Successfully updated ${successful} user(s)`);
        setPendingChanges({});
        await fetchData(); // Refresh data
      }

      if (failed > 0) {
        setError(`Failed to update ${failed} user(s)`);
      }

    } catch (error: any) {
      setError(error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setPendingChanges({});
    setAssignments(prev => prev.map(assignment => ({
      ...assignment,
      newRoleId: assignment.currentRoleId,
      newRoleName: assignment.currentRoleName
    })));
  };

  const getRoleColor = (roleName: string | null) => {
    if (!roleName) return 'bg-gray-100 text-gray-800';
    
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || 
                       (selectedRole === 'no-role' && !assignment.currentRoleId) ||
                       assignment.currentRoleId === selectedRole;
    return matchesSearch && matchesRole;
  });

  const hasChanges = Object.keys(pendingChanges).length > 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Role Assignment</h1>
          <p className="text-gray-600 mt-1">Assign roles to users manually</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={resetChanges}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Reset Changes
            </button>
          )}
          {hasChanges && (
            <button
              onClick={saveAllChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : `Save Changes (${Object.keys(pendingChanges).length})`}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
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
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Users with Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(user => user.role).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Changes</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(pendingChanges).length}
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

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Role Assignment Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Role</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">→</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">New Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => {
                const hasChange = assignment.currentRoleId !== assignment.newRoleId;
                const isPending = pendingChanges[assignment.userId];
                
                return (
                  <motion.tr
                    key={assignment.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`hover:bg-gray-50 transition-colors ${
                      hasChange ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">
                            {assignment.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{assignment.userName}</p>
                          <p className="text-sm text-gray-500">{assignment.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getRoleColor(assignment.currentRoleName)
                      }`}>
                        <Shield className="h-4 w-4 mr-1" />
                        {assignment.currentRoleName || 'No Role'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      {hasChange && (
                        <ArrowRight className="h-5 w-5 text-orange-500 mx-auto" />
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <select
                        value={assignment.newRoleId || ''}
                        onChange={(e) => handleRoleChange(assignment.userId, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      >
                        <option value="">No Role</option>
                        {roles.map(role => (
                          <option key={role._id} value={role._id}>{role.name}</option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-6 py-4">
                      {hasChange ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Current
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      {hasChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-900">Pending Changes</h3>
              <p className="text-orange-700 mt-1">
                You have {Object.keys(pendingChanges).length} pending role assignment(s)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetChanges}
                className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Cancel Changes
              </button>
              <button
                onClick={saveAllChanges}
                disabled={saving}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAssignment;
