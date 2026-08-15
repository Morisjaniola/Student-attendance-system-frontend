import { mockAuditLogs } from '../data/auditLogsData'
import type { AuthUser } from '../types/auth'
import type { AuditAction, AuditLog } from '../types/auditLog'

// Replace this in-memory mock with PHP API calls later:
// React -> auditLogService -> PHP API -> MySQL.
// Audit values are sanitized before being returned so credentials can never be
// displayed by this frontend module.
let auditLogs = [...mockAuditLogs]
const delay = (milliseconds = 240) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
const SENSITIVE_VALUE = /(password|passcode|token|credential|secret|hash)/i

function safeValue(value: string | null): string | null {
  return value && SENSITIVE_VALUE.test(value) ? '[REDACTED]' : value
}

function safeLog(log: AuditLog): AuditLog {
  return { ...log, description: safeValue(log.description) ?? '[REDACTED]', previousValue: safeValue(log.previousValue), newValue: safeValue(log.newValue) }
}

export function formatAuditDateTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'N/A'
  const dateLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${dateLabel} ${timeLabel}`
}

export const auditLogService = {
  async list(): Promise<AuditLog[]> {
    await delay()
    return auditLogs.map(safeLog)
  },

  // Kept for modules to submit activity records without exposing any sensitive
  // fields. The real backend logging will replace this in-memory store.
  async record(log: AuditLog): Promise<AuditLog> {
    await delay()
    const safe = safeLog(log)
    auditLogs = [safe, ...auditLogs]
    return safe
  },
}

/**
 * Records a successful user activity for the Audit Logs module (12.2).
 * The acting user is passed by the caller (pages read it from the auth store)
 * so services and stores stay free of circular dependencies. Sensitive values
 * are redacted by `record`. No-op when no actor is available.
 */
export async function recordAuditActivity(
  actor: AuthUser | null | undefined,
  input: {
    module: string
    action: AuditAction
    description: string
    entity?: string | null
    previousValue?: string | null
    newValue?: string | null
  },
): Promise<void> {
  if (!actor) return
  await auditLogService.record({
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    module: input.module,
    action: input.action,
    description: input.description,
    status: 'Success',
    entity: input.entity ?? null,
    previousValue: input.previousValue ?? null,
    newValue: input.newValue ?? null,
  })
}
