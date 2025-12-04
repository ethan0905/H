'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface CommunityLogoUploadProps {
  communityId: string;
  currentLogoUrl?: string | null;
  onLogoUpdated?: (logoUrl: string | null) => void;
}

export default function CommunityLogoUpload({
  communityId,
  currentLogoUrl,
  onLogoUpdated,
}: CommunityLogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useUserStore();

  // Only super admins can upload logos
  if (!user?.isSuperAdmin) {
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for logo)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload logo
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('communityId', communityId);
      formData.append('userId', user.id);

      const response = await fetch('/api/community/logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload logo');
      }

      const data = await response.json();
      setLogoUrl(data.url);
      setPreviewUrl(null);
      onLogoUpdated?.(data.url);
      
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the community logo?')) {
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(
        `/api/community/logo?communityId=${communityId}&userId=${user.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove logo');
      }

      setLogoUrl(null);
      onLogoUpdated?.(null);
      
      alert('Logo removed successfully!');
    } catch (error) {
      console.error('Error removing logo:', error);
      alert('Failed to remove logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current/Preview Logo */}
      {(logoUrl || previewUrl) && (
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-black shadow-xl">
          <img
            src={previewUrl || logoUrl || ''}
            alt="Community logo"
            className="w-full h-full object-cover"
          />
          {logoUrl && !previewUrl && (
            <button
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors disabled:opacity-50 shadow-lg"
              title="Remove logo"
            >
              <X size={14} />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="logo-upload"
          disabled={uploading}
        />
        <label
          htmlFor="logo-upload"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
            uploading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-[#00FFBD]/10 text-[#00FFBD] border border-[#00FFBD]/30 hover:bg-[#00FFBD]/20'
          }`}
        >
          <Upload size={16} />
          {logoUrl ? 'Change Logo' : 'Upload Logo'}
        </label>
        <div className="text-xs text-gray-500">
          <div>Max size: 5MB</div>
          <div>Recommended: 512x512px (square)</div>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 flex items-start gap-2">
        <ImageIcon size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          The logo will replace the default gradient icon in the community list and detail views.
          Square images work best.
        </p>
      </div>
    </div>
  );
}
