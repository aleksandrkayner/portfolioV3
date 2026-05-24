import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { getDb } from './index.js'
import { privileges, rolePrivileges, roles, userRoles } from './schema.js'

const DEFAULT_ROLES = [
  { name: 'admin', description: 'Full administrative access' },
  { name: 'member', description: 'Approved member with default access' },
]

const DEFAULT_PRIVILEGES = [
  { key: 'view:member_content', description: 'View member-only dashboard content' },
  { key: 'view:beta_features', description: 'Access beta features' },
  { key: 'admin:manage_users', description: 'Manage users and entitlements' },
]

async function seed() {
  const db = getDb(process.env.DATABASE_URL!)

  for (const role of DEFAULT_ROLES) {
    await db.insert(roles).values(role).onConflictDoNothing({ target: roles.name })
  }

  for (const privilege of DEFAULT_PRIVILEGES) {
    await db
      .insert(privileges)
      .values(privilege)
      .onConflictDoNothing({ target: privileges.key })
  }

  const [adminRole] = await db.select().from(roles).where(eq(roles.name, 'admin'))
  const [memberRole] = await db.select().from(roles).where(eq(roles.name, 'member'))
  const allPrivileges = await db.select().from(privileges)

  if (adminRole) {
    for (const privilege of allPrivileges) {
      await db
        .insert(rolePrivileges)
        .values({ roleId: adminRole.id, privilegeId: privilege.id })
        .onConflictDoNothing()
    }
  }

  if (memberRole) {
    const memberPrivilege = allPrivileges.find((p) => p.key === 'view:member_content')
    if (memberPrivilege) {
      await db
        .insert(rolePrivileges)
        .values({ roleId: memberRole.id, privilegeId: memberPrivilege.id })
        .onConflictDoNothing()
    }
  }

  console.log('Seed complete: roles, privileges, role mappings')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
