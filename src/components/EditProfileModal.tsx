'use client';

import { useState } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { User } from '@/types';
import { AvatarInitial } from '@/components/ui/AvatarInitial';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: { displayName: string; username: string; bio: string; profilePictureUrl?: string }) => void;
}

export default function EditProfileModal({ user, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

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
      let profilePictureUrl = user.profilePictureUrl;

      // Upload profile picture if selected
      if (selectedImage) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        profilePictureUrl = uploadData.url;
        setUploadingImage(false);
      }

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
          profilePictureUrl,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave({
          displayName: updatedUser.displayName,
          username: updatedUser.username,
          bio: updatedUser.bio,
          profilePictureUrl: updatedUser.profilePictureUrl,
        });
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
      setUploadingImage(false);
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

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {imagePreview || user.profilePictureUrl || user.avatar ? (
                  <img
                    src={imagePreview || user.profilePictureUrl || user.avatar || ''}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <AvatarInitial
                    name={user.displayName || user.username || 'U'}
                    imageUrl={undefined}
                    size="lg"
                  />
                )}
                <label
                  htmlFor="profile-picture-input"
                  className="absolute bottom-0 right-0 bg-brand hover:bg-brand/80 text-black p-2 rounded-full cursor-pointer transition-colors"
                >
                  <Camera size={16} />
                </label>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a profile picture (max 5MB)
                </p>
                {(imagePreview || selectedImage) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-500 hover:text-red-400 transition-colors"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

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
            disabled={saving || uploadingImage || !displayName.trim() || !username.trim()}
            className="px-4 py-2 bg-brand text-black font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploadingImage ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Uploading image...
              </>
            ) : saving ? (
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
