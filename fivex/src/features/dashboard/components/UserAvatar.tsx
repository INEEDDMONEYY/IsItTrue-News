import type { AuthUser } from '@/features/auth/types/auth.types'

interface UserAvatarProps {
  user: AuthUser | null
  className?: string
}

export function UserAvatar({ user, className = '' }: UserAvatarProps) {
  const image = user?.authorProfile?.profileImage

  if (image) {
    return <img src={image} alt="" className={`rounded-full object-cover ${className}`} />
  }

  return (
    <div
      className={`rounded-full bg-gray-400 flex items-center justify-center font-medium text-white ${className}`}
    >
      {user?.name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}
