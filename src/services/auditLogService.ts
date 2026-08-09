import { mockAuditLogs } from '../data/auditLogsData'
import type { AuditLog } from '../types/auditLog'

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

  // Kept for future modules to submit mock activity records without exposing
  // any sensitive fields. It is not wired to backend logging in this phase.
  async record(log: AuditLog): Promise<AuditLog> {
    await delay()
    const safe = safeLog(log)
    auditLogs = [safe, ...auditLogs]
    return safe
  },
}
