import { Users, Settings, Shield, Database, Bell, Edit, Trash2, Plus, Building2, FileCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddUserModal } from '../components/AddUserModal';
import { AddRoleModal } from '../components/AddRoleModal';
import { AddAlertRuleModal } from '../components/AddAlertRuleModal';
import { AddEntityModal } from '../components/AddEntityModal';
import { TableScroll } from '../components/TableScroll';
import {
  listEntities,
  listPermissions,
  listRoles,
  listUsers,
  createUser,
  createRole,
  createEntity,
  deleteUser,
  deleteRole,
  deleteEntity,
  updateRole,
  updateUser,
  updateEntity,
  retrieveRole,
  listAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  fetchAdminSummary,
  type AppPermissionDto,
  type AdminAlertRuleApiRow,
} from '../api/adminApi';
import { ApiError } from '../api/client';

const FALLBACK_SYSTEM_STATS = [
  { label: 'Active Users', value: '—', icon: Users, color: '#2D6A4F' },
  { label: 'Roles', value: '—', icon: Shield, color: '#74C69D' },
  { label: 'Entities', value: '—', icon: Database, color: '#2D6A4F' },
  { label: 'Permissions', value: '—', icon: Settings, color: '#74C69D' },
];

const ALERT_CONDITION_LABELS: Record<string, string> = {
  outbreak_threshold: 'Cases exceed threshold',
  new_pest: 'New pest detected',
  compliance_drop: 'Scouting compliance drops below',
  severity_high: 'High severity case reported',
  geographic_cluster: 'Geographic cluster detected',
};

const ALERT_ACTION_LABELS: Record<string, string> = {
  email: 'Send Email',
  sms: 'Send SMS',
  both: 'Send Email & SMS',
  dashboard: 'Dashboard Notification Only',
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'entities' | 'alerts' | 'settings'>('users');
  const [activeEntitySubTab, setActiveEntitySubTab] = useState<'all' | 'exporters' | 'government' | 'partners'>('all');
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<AppPermissionDto[]>([]);

  const [statsCards, setStatsCards] = useState(FALLBACK_SYSTEM_STATS);
  const [users, setUsers] = useState<
    { id: string; name: string; role: string; email: string; phone: string; county: string; status: string; lastLogin: string }[]
  >([]);
  const [roles, setRoles] = useState<{ id: string; name: string; description: string; users: number; permissions: number }[]>([]);
  const [alertRules, setAlertRules] = useState<AdminAlertRuleApiRow[]>([]);
  const [entities, setEntities] = useState<
    {
      id: string;
      companyName: string;
      hcdaLicense: string;
      headAgronomist: string;
      linkedFarmers: number;
      status: boolean;
      email: string;
      phone: string;
      county: string;
      entityType: string;
      licenseExpiry: string;
    }[]
  >([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isAddAlertRuleModalOpen, setIsAddAlertRuleModalOpen] = useState(false);
  const [isAddEntityModalOpen, setIsAddEntityModalOpen] = useState(false);
  const [licenseExpiryFilter, setLicenseExpiryFilter] = useState<'all' | '30days' | '60days' | '90days'>('all');
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description: string; permissionIds: string[] } | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; email: string; phone: string; role: string; county: string } | null>(null);
  const [editingEntity, setEditingEntity] = useState<{
    id: string;
    companyName: string;
    hcdaLicense: string;
    headAgronomist: string;
    email: string;
    phone: string;
    county: string;
    entityType: string;
    licenseExpiry: string;
    status: boolean;
  } | null>(null);
  const [editingAlertRule, setEditingAlertRule] = useState<AdminAlertRuleApiRow | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setAdminLoading(true);
      setAdminError(null);
      try {
        const [u, r, e, p, alerts, summary] = await Promise.all([
          listUsers(),
          listRoles(),
          listEntities(),
          listPermissions(),
          listAlertRules().catch(() => [] as AdminAlertRuleApiRow[]),
          fetchAdminSummary().catch(() => null),
        ]);
        if (cancelled) return;
        setUsers(u);
        setRoles(r);
        setEntities(e);
        setPermissions(p);
        setAlertRules(alerts);
        if (summary) {
          setStatsCards([
            { label: 'Active Users', value: String(summary.active_users), icon: Users, color: '#2D6A4F' },
            { label: 'Roles', value: String(summary.roles_count), icon: Shield, color: '#74C69D' },
            { label: 'Entities', value: String(summary.entities_count), icon: Database, color: '#2D6A4F' },
            { label: 'Permissions', value: String(summary.permissions_count), icon: Settings, color: '#74C69D' },
          ]);
        }
      } catch (e) {
        if (cancelled) return;
        setUsers([]);
        setRoles([]);
        setEntities([]);
        setPermissions([]);
        const apiMsg = e instanceof ApiError ? e.getDetailMessage() : null;
        setAdminError(
          apiMsg
            ? `Could not load admin data: ${apiMsg}`
            : 'Could not load admin data. You may lack directory access (Staff/Superuser in Django admin, or an Administrator-class role), or the API is unreachable. Sign in again with an account that has those flags.',
        );
      } finally {
        if (cancelled) return;
        setAdminLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddUser = async (user: { id?: string; name: string; email: string; phone: string; role: string; county: string }) => {
    // Modal provides UI-shape user. Map to backend schema.
    setAdminError(null);
    const fullName = String(user.name ?? '').trim();
    const [firstName, ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(' ');
    const roleName = String(user.role ?? '').trim();
    const rolePayload =
      !roleName || roleName === 'Unknown' ? { role_name: null as string | null } : { role_name: roleName };
    try {
      if (user.id) {
        await updateUser(user.id, {
          phone_number: String(user.phone ?? '').trim(),
          email: String(user.email ?? '').trim() || null,
          first_name: firstName || fullName || 'User',
          last_name: lastName || ' ',
          ...rolePayload,
          county: String(user.county ?? '').trim() || null,
        });
      } else {
        await createUser({
          phone_number: String(user.phone ?? '').trim(),
          email: String(user.email ?? '').trim() || null,
          first_name: firstName || fullName || 'User',
          last_name: lastName || ' ',
          ...rolePayload,
          entity: null,
          county: String(user.county ?? '').trim() || null,
        });
      }
      const fresh = await listUsers();
      setUsers(fresh);
    } catch (e) {
      let msg =
        user.id
          ? 'Could not update user. Check the message below, field validation, and that the row id is a real user from the server (refresh if the list was empty).'
          : 'Could not create user. Check the message below and field validation.';
      if (e instanceof ApiError) {
        const d = e.getDetailMessage();
        if (d) msg = d;
        else if (e.status === 403) {
          msg =
            'Access denied (403). The app only accepts Staff status, Superuser, or roles Administrator / System Administrator / KEPHIS / HCDA. Django’s “superuser” only applies here if you sign in to this app with that same user (phone OTP) and Staff/Superuser are checked at /admin/ → Users.';
        } else if (e.status === 404) {
          msg =
            'User not found (404). Refresh the Admin page so the table loads from the API — placeholder rows are no longer used.';
        } else if (e.bodyText) {
          msg = `Request failed (HTTP ${e.status}): ${e.bodyText.slice(0, 500)}`;
        }
      }
      setAdminError(msg);
      throw e instanceof Error ? e : new Error(msg);
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    const row = users.find((u) => u.id === id);
    if (!row) return;
    const nextActive = row.status !== 'active';
    try {
      setAdminError(null);
      await updateUser(id, { is_active: nextActive });
      setUsers(await listUsers());
    } catch {
      setAdminError('Could not update user status.');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    deleteUser(id)
      .then(() => setUsers(users.filter((u) => u.id !== id)))
      .catch(() => setAdminError('Delete failed. Check your permissions and try again.'));
  };

  const handleAddRole = async (role: { id?: string; name: string; description: string; permissionIds: string[] }) => {
    try {
      setAdminError(null);
      if (role.id) {
        await updateRole(role.id, {
          role_name: role.name.trim(),
          description: role.description.trim() || null,
          permissions_input: role.permissionIds,
        });
      } else {
        await createRole({
          role_name: role.name.trim(),
          description: role.description.trim() || null,
          permissions_input: role.permissionIds,
        });
      }
      const fresh = await listRoles();
      setRoles(fresh);
    } catch {
      setAdminError(
        role.id ? 'Could not update role. Check required fields and your permissions.' : 'Could not create role. Check required fields and your permissions.'
      );
    }
  };

  const handleDeleteRole = (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    deleteRole(id)
      .then(() => setRoles(roles.filter((r) => r.id !== id)))
      .catch(() => setAdminError('Delete failed. Check your permissions and try again.'));
  };

  const handleSaveAlertRule = async (rule: {
    id?: string;
    name: string;
    condition: string;
    threshold: string;
    county: string;
    pest: string;
    action: string;
    recipients: string;
    status?: string;
  }) => {
    try {
      setAdminError(null);
      if (rule.id) {
        await updateAlertRule(rule.id, {
          name: rule.name.trim(),
          condition: rule.condition,
          threshold: String(rule.threshold).trim(),
          county: rule.county,
          pest: rule.pest,
          action: rule.action,
          recipients: rule.recipients.trim(),
          ...(rule.status ? { status: rule.status } : {}),
        });
      } else {
        await createAlertRule({
          name: rule.name.trim(),
          condition: rule.condition,
          threshold: String(rule.threshold).trim(),
          county: rule.county,
          pest: rule.pest,
          action: rule.action,
          recipients: rule.recipients.trim(),
          status: rule.status ?? 'active',
        });
      }
      setAlertRules(await listAlertRules());
    } catch {
      setAdminError(rule.id ? 'Could not update alert rule.' : 'Could not create alert rule.');
      throw new Error('save failed');
    }
  };

  const handleDeleteAlertRule = (id: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return;
    deleteAlertRule(id)
      .then(() => setAlertRules((prev) => prev.filter((r) => r.id !== id)))
      .catch(() => setAdminError('Delete failed. Check your permissions and try again.'));
  };

  const handleToggleAlertRule = (id: string) => {
    const rule = alertRules.find((r) => r.id === id);
    if (!rule) return;
    const next = rule.status === 'active' ? 'inactive' : 'active';
    updateAlertRule(id, { status: next })
      .then(() => setAlertRules((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r))))
      .catch(() => setAdminError('Could not update alert rule status.'));
  };

  const handleAddEntity = async (entity: any) => {
    try {
      setAdminError(null);
      const typeMap: Record<string, any> = {
        exporter: 'Exporter',
        kephis: 'Government - KEPHIS',
        hcda: 'Government - HCDA',
        partner: 'Partner Organization',
      };
      const payload = {
        entity_type: typeMap[String(entity.entityType ?? 'exporter')] ?? 'Exporter',
        company_name: String(entity.companyName ?? '').trim(),
        HCDA_license: String(entity.hcdaLicense ?? '').trim(),
        license_expiry_date: String(entity.licenseExpiry ?? '').trim(),
        head_agronomist: String(entity.headAgronomist ?? '').trim(),
        primary_county: String(entity.county ?? '').trim(),
        company_email: String(entity.email ?? '').trim(),
        phone_number: String(entity.phone ?? '').trim(),
        is_active: Boolean(entity.status ?? true),
      };

      if (entity.id) {
        await updateEntity(String(entity.id), payload);
      } else {
        await createEntity(payload);
      }
      const fresh = await listEntities();
      setEntities(fresh);
    } catch {
      setAdminError(entity?.id ? 'Could not update entity. Check required fields and your permissions.' : 'Could not create entity. Check required fields and your permissions.');
    }
  };

  const handleDeleteEntity = (id: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;
    deleteEntity(id)
      .then(() => setEntities(entities.filter((e) => e.id !== id)))
      .catch(() => setAdminError('Delete failed. Check your permissions and try again.'));
  };

  const handleToggleEntityStatus = (id: string) => {
    const entity = entities.find((x) => x.id === id);
    if (!entity) return;
    const next = !entity.status;
    updateEntity(id, { is_active: next })
      .then(() => setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, status: next } : e))))
      .catch(() => setAdminError('Could not update entity status.'));
  };

  const filteredEntities = entities.filter(entity => {
    if (licenseExpiryFilter === 'all') return true;
    const expiryDate = new Date(entity.licenseExpiry);
    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= parseInt(licenseExpiryFilter);
  });

  return (
    <>
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

      {adminLoading && (
        <div
          className="mb-4 p-4 rounded-lg border text-center"
          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          Loading admin data...
        </div>
      )}

      {adminError && (
        <div
          className="mb-4 p-4 rounded-lg border text-center"
          style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', fontFamily: 'IBM Plex Sans, sans-serif', color: '#991B1B' }}
        >
          {adminError}
        </div>
      )}

      {/* System Stats */}
      <div className="mb-4 grid grid-cols-1 gap-3 min-w-0 sm:mb-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
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
              onClick={() => {
                setEditingUser(null);
                setIsAddUserModalOpen(true);
              }}
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
          <TableScroll>
          <table className="w-full min-w-[720px]">
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
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(user.id)}
                      className="px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: user.status === 'active' ? '#74C69D20' : '#E0DDD6',
                        color: user.status === 'active' ? '#2D6A4F' : '#717182',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Edit user"
                        onClick={() => {
                          setEditingUser({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone ?? '',
                            role: user.role,
                            county: user.county,
                          });
                          setIsAddUserModalOpen(true);
                        }}
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
          </TableScroll>
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
              onClick={() => {
                setEditingRole(null);
                setIsAddRoleModalOpen(true);
              }}
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
          <TableScroll>
          <table className="w-full min-w-[720px]">
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
                        onClick={() => {
                          (async () => {
                            try {
                              const detail = await retrieveRole(role.id);
                              const raw = Array.isArray(detail.permissions) ? detail.permissions : [];
                              const byId = new Set(permissions.map((p) => p.id));
                              const selected =
                                raw.filter((x) => byId.has(x)).length > 0
                                  ? raw.filter((x) => byId.has(x))
                                  : raw
                                      .map((x) => permissions.find((p) => p.name === x)?.id)
                                      .filter(Boolean) as string[];
                              setEditingRole({
                                id: role.id,
                                name: detail.role_name ?? role.name,
                                description: detail.description ?? role.description,
                                permissionIds: selected,
                              });
                              setIsAddRoleModalOpen(true);
                            } catch {
                              setEditingRole({
                                id: role.id,
                                name: role.name,
                                description: role.description,
                                permissionIds: [],
                              });
                              setIsAddRoleModalOpen(true);
                            }
                          })();
                        }}
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
          </TableScroll>
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
              onClick={() => {
                setEditingEntity(null);
                setIsAddEntityModalOpen(true);
              }}
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
          <TableScroll>
          <table className="w-full min-w-[720px]">
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
                        onClick={() => {
                          setEditingEntity({
                            id: entity.id,
                            companyName: entity.companyName,
                            hcdaLicense: entity.hcdaLicense,
                            headAgronomist: entity.headAgronomist,
                            email: entity.email,
                            phone: entity.phone,
                            county: entity.county,
                            entityType: entity.entityType,
                            licenseExpiry: entity.licenseExpiry,
                            status: Boolean(entity.status),
                          });
                          setIsAddEntityModalOpen(true);
                        }}
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
          </TableScroll>

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

            <div className="grid grid-cols-1 gap-4 min-w-0 md:grid-cols-3 md:gap-6">
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
              onClick={() => {
                setEditingAlertRule(null);
                setIsAddAlertRuleModalOpen(true);
              }}
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
          <TableScroll>
          <table className="w-full min-w-[720px]">
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
                        {ALERT_ACTION_LABELS[rule.action] ?? rule.action}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {ALERT_CONDITION_LABELS[rule.condition] ?? rule.condition}
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
                        onClick={() => {
                          setEditingAlertRule(rule);
                          setIsAddAlertRuleModalOpen(true);
                        }}
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
          </TableScroll>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 gap-4 min-w-0 md:grid-cols-3 md:gap-6">
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
        onClose={() => {
          setIsAddUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleAddUser}
        initialUser={editingUser}
        roleOptions={roles.map((r) => r.name)}
      />
      <AddRoleModal 
        isOpen={isAddRoleModalOpen}
        onClose={() => {
          setIsAddRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSave={handleAddRole}
        permissions={permissions}
        initialRole={editingRole}
      />
      <AddAlertRuleModal 
        isOpen={isAddAlertRuleModalOpen}
        onClose={() => {
          setIsAddAlertRuleModalOpen(false);
          setEditingAlertRule(null);
        }}
        onSave={handleSaveAlertRule}
        initialRule={editingAlertRule}
      />
      <AddEntityModal 
        isOpen={isAddEntityModalOpen}
        onClose={() => {
          setIsAddEntityModalOpen(false);
          setEditingEntity(null);
        }}
        onSave={handleAddEntity}
        initialEntity={editingEntity}
      />
    </>
  );
}