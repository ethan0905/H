"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useUserStore } from '@/store/userStore';

interface UserProfileProps {
  profile: any
  setProfile: (profile: any) => void
}

export function UserProfile({ profile, setProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(profile?.bio || "")
  const [username, setUsername] = useState(profile?.username || "")
  const { user } = useUserStore();

  const handleSave = () => {
    const updated = {
      ...profile,
      username,
      bio,
    }
    setProfile(updated)
    localStorage.setItem("user_profile", JSON.stringify(updated))
    setIsEditing(false)
  }

  if (!profile && !user) return null

  const currentProfile = profile || user;

  return (
    <div className="max-w-2xl mx-auto border-l border-r border-border">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent h-32 relative"></div>

      {/* Profile */}
      <div className="p-6 pb-4">
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <img
            src={currentProfile.avatar || "/placeholder.svg"}
            alt={username || currentProfile.displayName || currentProfile.username}
            className="w-32 h-32 rounded-full border-4 border-background bg-card"
          />
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="ml-auto">
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-card border border-border rounded-lg text-foreground outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-card border border-border rounded-lg text-foreground outline-none focus:border-accent resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-accent text-background">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="border-border">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {username || currentProfile.displayName || currentProfile.username}
              </h1>
              <p className="text-muted-foreground">
                {currentProfile.isVerified ? "Verified Human ✓" : "User"}
              </p>
            </div>
            <p className="text-foreground mb-4">{bio || "No bio yet."}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="font-bold text-foreground">{currentProfile.followers?.length || 0}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="font-bold text-foreground">{currentProfile.following?.length || 0}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Posts */}
      <div className="border-t border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Your Posts</h2>
        <p className="text-muted-foreground">No posts yet. Start the conversation!</p>
      </div>
    </div>
  )
}
