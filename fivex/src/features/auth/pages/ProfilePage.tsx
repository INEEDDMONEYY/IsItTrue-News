import { useAuth } from '@/app/providers/AuthProvider'

export function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-[560px] mx-auto py-10 md:py-14">
      <h1 className="text-3xl font-semibold text-heading mb-6">Your Profile</h1>

      <div className="rounded-xl border border-border p-6 flex flex-col gap-3">
        <div>
          <p className="text-xs text-text-dim uppercase mb-0.5">Name</p>
          <p className="text-sm text-heading">{user?.name}</p>
        </div>
        <div>
          <p className="text-xs text-text-dim uppercase mb-0.5">Email</p>
          <p className="text-sm text-heading">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-text-dim uppercase mb-0.5">Role</p>
          <p className="text-sm text-heading capitalize">{user?.role}</p>
        </div>
      </div>

      <button
        onClick={() => logout()}
        className="mt-6 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:border-accent-border hover:text-accent transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
