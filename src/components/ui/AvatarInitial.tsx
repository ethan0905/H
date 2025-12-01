interface AvatarInitialProps {
  name: string
  imageUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AvatarInitial({ name, imageUrl, size = "md", className = "" }: AvatarInitialProps) {
  const initial = name?.charAt(0)?.toUpperCase() || "?"

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-3xl",
  }

  if (imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-[#00FFBD] shrink-0 ${className}`}>
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-black border-2 border-[#00FFBD] rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{ color: "#00FFBD" }}
    >
      {initial}
    </div>
  )
}
