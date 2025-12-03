'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface CommunityBannerUploadProps {
  communityId: string;
  currentBannerUrl?: string | null;
  onBannerUpdated?: (bannerUrl: string | null) => void;
}

export default function CommunityBannerUpload({
  communityId,
  currentBannerUrl,
  onBannerUpdated,
}: CommunityBannerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(currentBannerUrl || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useUserStore();

  // Only super admins can upload banners
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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload banner
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('banner', file);
      formData.append('communityId', communityId);
      formData.append('userId', user.id);

      const response = await fetch('/api/community/banner', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload banner');
      }

      const data = await response.json();
      setBannerUrl(data.url);
      setPreviewUrl(null);
      onBannerUpdated?.(data.url);
      
      alert('Banner uploaded successfully!');
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner. Please try again.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!confirm('Are you sure you want to remove the community banner?')) {
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(
        `/api/community/banner?communityId=${communityId}&userId=${user.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove banner');
      }

      setBannerUrl(null);
      onBannerUpdated?.(null);
      
      alert('Banner removed successfully!');
    } catch (error) {
      console.error('Error removing banner:', error);
      alert('Failed to remove banner. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current/Preview Banner */}
      {(bannerUrl || previewUrl) && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-800">
          <img
            src={previewUrl || bannerUrl || ''}
            alt="Community banner"
            className="w-full h-full object-cover"
          />
          {bannerUrl && !previewUrl && (
            <button
              onClick={handleRemoveBanner}
              disabled={uploading}
              className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors disabled:opacity-50"
              title="Remove banner"
            >
              <X size={16} />
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
          id="banner-upload"
          disabled={uploading}
        />
        <label
          htmlFor="banner-upload"
          className={`flex items-center gap-2 px-4 py-2 bg-[#00FFBD] hover:bg-[#00E5A8] text-black font-semibold rounded-lg cursor-pointer transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {bannerUrl ? (
            <>
              <ImageIcon size={18} />
              <span>Change Banner</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Upload Banner</span>
            </>
          )}
        </label>
        
        <div className="text-xs text-gray-500">
          <p>Recommended: 1500x500px</p>
          <p>Max size: 10MB</p>
        </div>
      </div>

      {/* Super Admin Badge */}
      <div className="flex items-center gap-2 text-sm text-[#00FFBD]">
        <div className="px-2 py-1 bg-[#00FFBD]/10 border border-[#00FFBD]/30 rounded">
          Super Admin Only
        </div>
      </div>
    </div>
  );
}
