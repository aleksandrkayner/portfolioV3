import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from '../db/schema.js'
import { adminAuditLog } from '../db/schema.js'

type Db = PostgresJsDatabase<typeof schema>

export async function logAdminAction(
  db: Db,
  adminUserId: string,
  action: string,
  targetUserId?: string,
  details?: string,
): Promise<void> {
  await db.insert(adminAuditLog).values({
    adminUserId,
    action,
    targetUserId: targetUserId ?? null,
    details: details ?? null,
  })
}
