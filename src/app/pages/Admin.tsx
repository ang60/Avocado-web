import { Layout } from '../components/Layout';
import { Users, Settings, Shield, Activity, Database, Bell, Edit, Trash2, Plus, Building2, FileCheck, Calendar } from 'lucide-react';
import { useState } from 'react';
import { AddUserModal } from '../components/AddUserModal';
import { AddRoleModal } from '../components/AddRoleModal';
import { AddAlertRuleModal } from '../components/AddAlertRuleModal';
import { AddEntityModal } from '../components/AddEntityModal';

const systemStats = [
  { label: 'Active Users', value: '42', icon: Users, color: '#2D6A4F' },
  { label: 'System Uptime', value: '99.8%', icon: Activity, color: '#74C69D' },
  { label: 'Database Size', value: '12.4 GB', icon: Database, color: '#2D6A4F' },
  { label: 'API Calls Today', value: '18,542', icon: Settings, color: '#74C69D' },
];

const initialUsers = [
  { id: '1', name: 'Jane Wambui', role: 'System Administrator', email: 'jane.wambui@avoguard.ke', phone: '+254 712 345 678', county: 'Murang\'a', status: 'active', lastLogin: '2 hours ago' },
  { id: '2', name: 'Peter Mwangi', role: 'Field Scout', email: 'peter.mwangi@avoguard.ke', phone: '+254 723 456 789', county: 'Nyeri', status: 'active', lastLogin: '4 hours ago' },
  { id: '3', name: 'Grace Achieng', role: 'Agronomist', email: 'grace.achieng@avoguard.ke', phone: '+254 734 567 890', county: 'Kiambu', status: 'active', lastLogin: '5 hours ago' },
  { id: '4', name: 'Samuel Omondi', role: 'Field Scout', email: 'samuel.omondi@avoguard.ke', phone: '+254 745 678 901', county: 'Murang\'a', status: 'active', lastLogin: '1 day ago' },
  { id: '5', name: 'Mary Akinyi', role: 'Regional Coordinator', email: 'mary.akinyi@avoguard.ke', phone: '+254 756 789 012', county: 'Meru', status: 'inactive', lastLogin: '3 days ago' },
];

const initialRoles = [
  { id: '1', name: 'System Administrator', description: 'Full system access and configuration', users: 2, permissions: 15 },
  { id: '2', name: 'Agronomist', description: 'Review cases and provide recommendations', users: 8, permissions: 10 },
  { id: '3', name: 'Field Scout', description: 'Submit scouting reports and manage cases', users: 24, permissions: 7 },
  { id: '4', name: 'Farm Manager', description: 'View reports and compliance data', users: 6, permissions: 5 },
  { id: '5', name: 'Regional Coordinator', description: 'Coordinate regional activities and monitor compliance', users: 2, permissions: 12 },
];

const initialAlertRules = [
  { id: '1', name: 'High Thrips Outbreak - Murang\'a', condition: 'Cases exceed threshold', threshold: '10', county: 'Murang\'a', pest: 'Avocado Thrips', action: 'Email & SMS', status: 'active', triggered: 3, lastTriggered: '2 days ago' },
  { id: '2', name: 'New Pest Detection Alert', condition: 'New pest detected', threshold: '1', county: 'All Counties', pest: 'All Pests', action: 'Email', status: 'active', triggered: 1, lastTriggered: '1 week ago' },
  { id: '3', name: 'Compliance Drop Alert', condition: 'Scouting compliance drops below', threshold: '90%', county: 'All Counties', pest: 'All Pests', action: 'Dashboard', status: 'active', triggered: 0, lastTriggered: 'Never' },
  { id: '4', name: 'Geographic Cluster - Kiambu', condition: 'Geographic cluster detected', threshold: '5', county: 'Kiambu', pest: 'Phytophthora Root Rot', action: 'Email & SMS', status: 'inactive', triggered: 2, lastTriggered: '3 weeks ago' },
];

const initialEntities = [
  { id: '1', companyName: 'Vegpro Kenya Ltd', hcdaLicense: 'HCDA/EX/2024/1287', headAgronomist: 'Dr. James Kamau', linkedFarmers: 142, status: true, email: 'info@vegpro.co.ke', phone: '+254 720 123 456', county: 'Kiambu', entityType: 'exporter', licenseExpiry: '2026-12-31' },
  { id: '2', companyName: 'FreshPack Exporters', hcdaLicense: 'HCDA/EX/2023/0892', headAgronomist: 'Mary Wanjiku', linkedFarmers: 98, status: true, email: 'contact@freshpack.co.ke', phone: '+254 733 456 789', county: 'Murang\'a', entityType: 'exporter', licenseExpiry: '2026-08-15' },
  { id: '3', companyName: 'Avocado Direct Ltd', hcdaLicense: 'HCDA/EX/2025/0156', headAgronomist: 'Peter Ochieng', linkedFarmers: 67, status: true, email: 'admin@avocadodirect.co.ke', phone: '+254 745 678 901', county: 'Nyeri', entityType: 'exporter', licenseExpiry: '2027-03-20' },
  { id: '4', companyName: 'Kakuzi PLC', hcdaLicense: 'HCDA/EX/2022/0543', headAgronomist: 'Grace Muthoni', linkedFarmers: 210, status: false, email: 'support@kakuzi.co.ke', phone: '+254 756 789 012', county: 'Murang\'a', entityType: 'exporter', licenseExpiry: '2026-06-30' },
  { id: '5', companyName: 'KEPHIS Central Office', hcdaLicense: 'N/A', headAgronomist: 'Dr. Samuel Njoroge', linkedFarmers: 0, status: true, email: 'info@kephis.org', phone: '+254 767 890 123', county: 'Nairobi', entityType: 'kephis', licenseExpiry: 'N/A' },
  { id: '6', companyName: 'HCDA Headquarters', hcdaLicense: 'N/A', headAgronomist: 'Ann Wairimu', linkedFarmers: 0, status: true, email: 'contact@hcda.or.ke', phone: '+254 778 901 234', county: 'Nairobi', entityType: 'hcda', licenseExpiry: 'N/A' },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'entities' | 'alerts' | 'settings'>('users');
  const [activeEntitySubTab, setActiveEntitySubTab] = useState<'all' | 'exporters' | 'government' | 'partners'>('all');
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [alertRules, setAlertRules] = useState(initialAlertRules);
  const [entities, setEntities] = useState(initialEntities);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isAddAlertRuleModalOpen, setIsAddAlertRuleModalOpen] = useState(false);
  const [isAddEntityModalOpen, setIsAddEntityModalOpen] = useState(false);
  const [licenseExpiryFilter, setLicenseExpiryFilter] = useState<'all' | '30days' | '60days' | '90days'>('all');

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

  const handleAddEntity = (entity: any) => {
    setEntities([...entities, { ...entity, id: String(entities.length + 1) }]);
  };

  const handleDeleteEntity = (id: string) => {
    if (confirm('Are you sure you want to delete this entity?')) {
      setEntities(entities.filter(e => e.id !== id));
    }
  };

  const handleToggleEntityStatus = (id: string) => {
    setEntities(entities.map(entity => 
      entity.id === id 
        ? { ...entity, status: !entity.status }
        : entity
    ));
  };

  const filteredEntities = entities.filter(entity => {
    if (licenseExpiryFilter === 'all') return true;
    const expiryDate = new Date(entity.licenseExpiry);
    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= parseInt(licenseExpiryFilter);
  });

  return (
    <Layout>
      <header className="mb-4 md:mb-5">
        <h1 
          className="mb-1 text-2xl sm:text-3xl" 
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
      <div className="mb-4 grid grid-cols-4 gap-4 sm:mb-5 sm:gap-5">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
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
            onClick={() => setActiveTab('entities')}
            className="pb-3 px-2 transition-colors"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: activeTab === 'entities' ? '#2D6A4F' : '#717182',
              borderBottom: activeTab === 'entities' ? '2px solid #2D6A4F' : '2px solid transparent',
            }}
          >
            Entities
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

      {/* Entities Tab */}
      {activeTab === 'entities' && (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Entity Management
            </h3>
            <button 
              onClick={() => setIsAddEntityModalOpen(true)}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              <Plus className="w-4 h-4" />
              Add Entity
            </button>
          </div>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Filter by License Expiry
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setLicenseExpiryFilter('all')}
                className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: licenseExpiryFilter === 'all' ? '#74C69D20' : '#E0DDD6',
                  color: licenseExpiryFilter === 'all' ? '#2D6A4F' : '#717182',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                All
              </button>
              <button
                onClick={() => setLicenseExpiryFilter('30days')}
                className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: licenseExpiryFilter === '30days' ? '#74C69D20' : '#E0DDD6',
                  color: licenseExpiryFilter === '30days' ? '#2D6A4F' : '#717182',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                30 Days
              </button>
              <button
                onClick={() => setLicenseExpiryFilter('60days')}
                className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: licenseExpiryFilter === '60days' ? '#74C69D20' : '#E0DDD6',
                  color: licenseExpiryFilter === '60days' ? '#2D6A4F' : '#717182',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                60 Days
              </button>
              <button
                onClick={() => setLicenseExpiryFilter('90days')}
                className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: licenseExpiryFilter === '90days' ? '#74C69D20' : '#E0DDD6',
                  color: licenseExpiryFilter === '90days' ? '#2D6A4F' : '#717182',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                90 Days
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Company Name
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  HCDA License
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Head Agronomist
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Linked Farmers
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  License Expiry
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map((entity, index) => (
                <tr 
                  key={entity.id}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== filteredEntities.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        {entity.companyName}
                      </div>
                      <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {entity.entityType.charAt(0).toUpperCase() + entity.entityType.slice(1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {entity.hcdaLicense}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {entity.headAgronomist}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {entity.linkedFarmers}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleEntityStatus(entity.id)}
                      className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: entity.status ? '#74C69D20' : '#E0DDD6',
                        color: entity.status ? '#2D6A4F' : '#717182',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {entity.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {entity.licenseExpiry}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Edit entity"
                      >
                        <Edit className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntity(entity.id)}
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Delete entity"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bulk Import Section - Available on Entities Tab */}
          <div 
            className="rounded-lg border p-6 mt-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="mb-2" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332', fontSize: '24px' }}>
                  Bulk Link Farmers to Exporters
                </h3>
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Upload a CSV file to link multiple farmers to exporters in one operation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Step 1 */}
              <div 
                className="p-5 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: '#F7F4EF',
                  borderColor: '#40916C',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: '#40916C', color: '#FFFFFF' }}
                  >
                    1
                  </div>
                  <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                    Download Template
                  </h4>
                </div>
                <p className="text-sm mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Get the CSV template with required columns
                </p>
                <button
                  className="w-full px-4 py-2.5 rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                  onClick={() => {
                    const csvContent = 'Farmer_ID,Exporter_ID,Contract_Start_Date,Season_Year\nFRM-1024,1,2026-04-01,2026\nFRM-1023,2,2026-04-01,2026';
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'farmer_exporter_link_template.csv';
                    a.click();
                  }}
                >
                  <FileCheck className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>

              {/* Step 2 */}
              <div 
                className="p-5 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: '#F7F4EF',
                  borderColor: '#74C69D',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: '#74C69D', color: '#1B4332' }}
                  >
                    2
                  </div>
                  <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                    Fill Template
                  </h4>
                </div>
                <p className="text-sm mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Add Farmer IDs and Exporter IDs in Excel
                </p>
                <div 
                  className="p-3 rounded border text-xs"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E0DDD6',
                    fontFamily: 'IBM Plex Mono, monospace',
                    color: '#1B4332',
                  }}
                >
                  <div>Farmer_ID, Exporter_ID</div>
                  <div className="text-gray-400">FRM-1024, 1</div>
                  <div className="text-gray-400">FRM-1023, 2</div>
                </div>
              </div>

              {/* Step 3 */}
              <div 
                className="p-5 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: '#F7F4EF',
                  borderColor: '#2D6A4F',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF' }}
                  >
                    3
                  </div>
                  <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                    Upload & Validate
                  </h4>
                </div>
                <p className="text-sm mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  System validates IDs and creates links
                </p>
                <label
                  className="w-full px-4 py-2.5 rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: '#40916C',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  <Building2 className="w-4 h-4" />
                  Upload CSV File
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        alert(`File "${e.target.files[0].name}" uploaded successfully! Validating farmer-exporter links...`);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Info Box */}
            <div 
              className="rounded-lg p-4 border-l-4 mt-6"
              style={{ 
                backgroundColor: '#F0FAF3',
                borderColor: '#40916C',
              }}
            >
              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                <strong>Data Validation:</strong> The system will verify that both Farmer_ID and Exporter_ID exist before creating links. 
                Any invalid entries will be reported in an error log for correction.
              </p>
            </div>
          </div>
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
      <AddEntityModal 
        isOpen={isAddEntityModalOpen}
        onClose={() => setIsAddEntityModalOpen(false)}
        onSave={handleAddEntity}
      />
    </Layout>
  );
}