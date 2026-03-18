import { Layout } from '../components/Layout';
import { Users, Settings, Shield, Activity, Database, Bell, Edit, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddUserModal } from '../components/AddUserModal';
import { AddRoleModal } from '../components/AddRoleModal';
import { AddAlertRuleModal } from '../components/AddAlertRuleModal';
import { fetchAdmin } from '../api/placeholderApi';
import type {
  AdminSystemStat,
  AdminUserRow,
  AdminRoleRow,
  AdminAlertRuleRow,
} from '../api/types';

const STAT_ICONS = {
  users: Users,
  activity: Activity,
  database: Database,
  settings: Settings,
} as const;

export function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'alerts' | 'settings'>('users');
  const [systemStats, setSystemStats] = useState<AdminSystemStat[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<AdminRoleRow[]>([]);
  const [alertRules, setAlertRules] = useState<AdminAlertRuleRow[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdmin()
      .then((payload) => {
        if (!cancelled) {
          setSystemStats(payload.systemStats);
          setUsers(payload.users);
          setRoles(payload.roles);
          setAlertRules(payload.alertRules);
          setAdminError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setAdminError('Could not load admin data.');
      })
      .finally(() => {
        if (!cancelled) setAdminLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isAddAlertRuleModalOpen, setIsAddAlertRuleModalOpen] = useState(false);

  const handleAddUser = (user: any) => {
    setUsers([...users, { ...user, id: String(users.length + 1) }]);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleAddRole = (role: any) => {
    setRoles([...roles, { ...role, id: String(roles.length + 1) }]);
  };

  const handleDeleteRole = (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  const handleAddAlertRule = (rule: any) => {
    setAlertRules([...alertRules, { ...rule, id: String(alertRules.length + 1) }]);
  };

  const handleDeleteAlertRule = (id: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      setAlertRules(alertRules.filter(r => r.id !== id));
    }
  };

  const handleToggleAlertRule = (id: string) => {
    setAlertRules(alertRules.map(rule => 
      rule.id === id 
        ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
        : rule
    ));
  };

  if (adminLoading) {
    return (
      <Layout>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading admin…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {adminError && (
        <div
          className="mb-4 p-4 rounded-lg border"
          style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {adminError}
        </div>
      )}
      <header className="mb-8">
        <h1 
          className="text-4xl mb-2" 
          style={{ 
            fontFamily: 'DM Serif Display, serif',
            color: '#1B4332'
          }}
        >
          Admin
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          System administration and user management
        </p>
      </header>

      {/* System Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat, index) => {
          const Icon = STAT_ICONS[stat.icon];
          return (
            <div 
              key={index}
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b" style={{ borderColor: '#E0DDD6' }}>
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className="pb-3 px-2 transition-colors"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: activeTab === 'users' ? '#2D6A4F' : '#717182',
              borderBottom: activeTab === 'users' ? '2px solid #2D6A4F' : '2px solid transparent',
            }}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className="pb-3 px-2 transition-colors"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: activeTab === 'roles' ? '#2D6A4F' : '#717182',
              borderBottom: activeTab === 'roles' ? '2px solid #2D6A4F' : '2px solid transparent',
            }}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className="pb-3 px-2 transition-colors"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: activeTab === 'alerts' ? '#2D6A4F' : '#717182',
              borderBottom: activeTab === 'alerts' ? '2px solid #2D6A4F' : '2px solid transparent',
            }}
          >
            Alert Rules
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="pb-3 px-2 transition-colors"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: activeTab === 'settings' ? '#2D6A4F' : '#717182',
              borderBottom: activeTab === 'settings' ? '2px solid #2D6A4F' : '2px solid transparent',
            }}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              User Management
            </h3>
            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  County
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Last Login
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user.id}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== users.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        {user.name}
                      </div>
                      <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {user.role}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {user.county}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: user.status === 'active' ? '#74C69D20' : '#E0DDD6',
                        color: user.status === 'active' ? '#2D6A4F' : '#717182',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Role Management
            </h3>
            <button 
              onClick={() => setIsAddRoleModalOpen(true)}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Role Name
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Description
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Users
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Permissions
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr 
                  key={role.id}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== roles.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {role.name}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {role.description}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {role.users}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {role.permissions}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Edit role"
                      >
                        <Edit className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Delete role"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alert Rules Tab */}
      {activeTab === 'alerts' && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Alert Rules Management
            </h3>
            <button 
              onClick={() => setIsAddAlertRuleModalOpen(true)}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              <Plus className="w-4 h-4" />
              Create Alert Rule
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Rule Name
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Condition
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  County
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Triggered
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {alertRules.map((rule, index) => (
                <tr 
                  key={rule.id}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== alertRules.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        {rule.name}
                      </div>
                      <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {rule.action}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {rule.condition}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {rule.county}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAlertRule(rule.id)}
                      className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: rule.status === 'active' ? '#74C69D20' : '#E0DDD6',
                        color: rule.status === 'active' ? '#2D6A4F' : '#717182',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        {rule.triggered} times
                      </div>
                      <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Last: {rule.lastTriggered}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Edit alert rule"
                      >
                        <Edit className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteAlertRule(rule.id)}
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Delete alert rule"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Quick Settings */}
          <div 
            className="rounded-lg border p-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Quick Settings
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50" style={{ textAlign: 'left' }}>
                <Settings className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>System Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50" style={{ textAlign: 'left' }}>
                <Shield className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Security</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50" style={{ textAlign: 'left' }}>
                <Bell className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Notifications</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50" style={{ textAlign: 'left' }}>
                <Database className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Backup & Restore</span>
              </button>
            </div>
          </div>

          {/* System Info */}
          <div 
            className="col-span-2 rounded-lg border p-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              System Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-3 border-b" style={{ borderColor: '#E0DDD6' }}>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Version</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>AvoGuard v2.4.1</span>
              </div>
              <div className="flex justify-between pb-3 border-b" style={{ borderColor: '#E0DDD6' }}>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Environment</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Production</span>
              </div>
              <div className="flex justify-between pb-3 border-b" style={{ borderColor: '#E0DDD6' }}>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Server Location</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Nairobi, Kenya</span>
              </div>
              <div className="flex justify-between pb-3 border-b" style={{ borderColor: '#E0DDD6' }}>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Last Backup</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>March 17, 2026 - 03:00 EAT</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Next Scheduled Backup</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>March 18, 2026 - 03:00 EAT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSave={handleAddUser}
      />
      <AddRoleModal 
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        onSave={handleAddRole}
      />
      <AddAlertRuleModal 
        isOpen={isAddAlertRuleModalOpen}
        onClose={() => setIsAddAlertRuleModalOpen(false)}
        onSave={handleAddAlertRule}
      />
    </Layout>
  );
}