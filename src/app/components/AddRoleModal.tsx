import { X } from 'lucide-react';
import { useState } from 'react';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: { id?: string; name: string; description: string; permissionIds: string[] }) => void;
  permissions: Array<{ id: string; name: string }>;
  initialRole?: { id: string; name: string; description: string; permissionIds: string[] } | null;
}

export function AddRoleModal({ isOpen, onClose, onSave, permissions, initialRole }: AddRoleModalProps) {
  const [formData, setFormData] = useState({
    name: initialRole?.name ?? '',
    description: initialRole?.description ?? '',
    permissionIds: initialRole?.permissionIds ?? ([] as string[]),
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialRole?.id,
      name: formData.name,
      description: formData.description,
      permissionIds: formData.permissionIds,
    });
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
    });
    onClose();
  };

  const togglePermission = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((p) => p !== id)
        : [...prev.permissionIds, id],
    }));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
        >
          <h2 
            className="text-xl"
            style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
          >
            {initialRole ? 'Edit Role' : 'Create New Role'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#717182' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Role Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="e.g., Regional Manager"
              />
            </div>

            {/* Description */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
                rows={3}
                placeholder="Brief description of this role's responsibilities"
              />
            </div>

            {/* Permissions */}
            <div>
              <label 
                className="block text-sm mb-3"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Permissions
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {permissions.map((p) => {
                  const selected = formData.permissionIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50/50 transition-colors"
                      style={{
                        borderColor: selected ? '#2D6A4F' : '#E0DDD6',
                        backgroundColor: selected ? '#74C69D10' : '#FFFFFF',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => togglePermission(p.id)}
                        className="w-4 h-4"
                        style={{ accentColor: '#2D6A4F' }}
                      />
                      <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '14px' }}>
                        {p.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: '#E0DDD6' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border transition-colors"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderColor: '#E0DDD6',
                color: '#717182',
                backgroundColor: '#FFFFFF',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg transition-colors"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
              }}
            >
              {initialRole ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
