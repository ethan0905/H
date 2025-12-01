interface AvatarInitialProps {
  name: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function AvatarInitial({ name, size = "md" }: AvatarInitialProps) {
  const initial = name.charAt(0).toUpperCase()

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-3xl",
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-black border-2 border-[#00FFBD] rounded-full flex items-center justify-center font-bold`}
      style={{ color: "#00FFBD" }}
    >
      {initial}
    </div>
  )
}
