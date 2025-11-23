'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { User } from '@/types';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: { displayName: string; username: string; bio: string }) => void;
}

export default function EditProfileModal({ user, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError('Display name and username are required');
      return;
    }

    if (username.includes(' ')) {
      setError('Username cannot contain spaces');
      return;
    }

    if (displayName.length > 50) {
      setError('Display name must be 50 characters or less');
      return;
    }

    if (username.length > 30) {
      setError('Username must be 30 characters or less');
      return;
    }

    if (bio.length > 160) {
      setError('Bio must be 160 characters or less');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          displayName: displayName.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim(),
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave({
          displayName: updatedUser.displayName,
          username: updatedUser.username,
          bio: updatedUser.bio,
        });
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Your display name"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">{displayName.length}/50 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-muted-foreground">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                className="w-full pl-8 pr-3 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="username"
                maxLength={30}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{username.length}/30 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/160 characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim() || !username.trim()}
            className="px-4 py-2 bg-brand text-black font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
