import { observer } from 'mobx-react-lite'
import { resolveAuthStore } from '../../di/container'

const authStore = resolveAuthStore()

export const AccountStatusBanner = observer(function AccountStatusBanner() {
  if (!authStore.isAuthenticated) return null

  if (authStore.isPending) {
    return (
      <div
        role="status"
        className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-dashboard-text"
      >
        Your account is pending approval. You will see member content once an admin approves your
        registration.
      </div>
    )
  }

  if (authStore.user?.status === 'rejected') {
    return (
      <div
        role="status"
        className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
      >
        Your registration was not approved. Contact the site owner if you believe this is a mistake.
      </div>
    )
  }

  if (authStore.isApproved && authStore.hasPrivilege('view:member_content')) {
    return (
      <div
        role="status"
        className="mb-6 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-dashboard-text"
      >
        Member access active — additional content will appear here as it is added.
      </div>
    )
  }

  return null
})
