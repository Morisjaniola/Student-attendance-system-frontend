import { StatCard } from '../cards/StatCard'
import { CircleCheck, CircleX, Clock, ClipboardList, FileCheck2 } from 'lucide-react'
import type { StatMetric } from '../../types/dashboard'
import type { AttendanceStatistics as AttendanceStatisticsData } from '../../types/analytics'
import { formatNumber } from '../../utils/format'

interface AttendanceStatisticsProps {
  statistics: AttendanceStatisticsData
  /** Number of distinct school days in the filtered set. */
  days: number
}

export function AttendanceStatistics({ statistics, days }: AttendanceStatisticsProps) {
  const { total, present, absent, late, excused } = statistics

  const percentOf = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0)

  const metrics: StatMetric[] = [
    {
      id: 'total',
      title: 'Total Attendance Records',
      value: formatNumber(total),
      description: `Recorded across ${days} school day${days === 1 ? '' : 's'}`,
      change: `${formatNumber(total)} sessions`,
      trend: 'up',
      color: 'blue',
      icon: ClipboardList,
    },
    {
      id: 'present',
      title: 'Present',
      value: formatNumber(present),
      description: 'Present attendance records',
      change: `${percentOf(present)}% of total`,
      trend: 'up',
      color: 'green',
      icon: CircleCheck,
    },
    {
      id: 'absent',
      title: 'Absent',
      value: formatNumber(absent),
      description: 'Missed attendance records',
      change: `${percentOf(absent)}% of total`,
      trend: 'down',
      color: 'red',
      icon: CircleX,
    },
    {
      id: 'late',
      title: 'Late',
      value: formatNumber(late),
      description: 'Arrived after 8:00 AM',
      change: `${percentOf(late)}% of total`,
      // Down renders the arrow in red — a warning cue for late records.
      trend: 'down',
      color: 'orange',
      icon: Clock,
    },
    {
      id: 'excused',
      title: 'Excused',
      value: formatNumber(excused),
      description: 'Approved excused absences',
      change: `${percentOf(excused)}% of total`,
      trend: 'up',
      color: 'violet',
      icon: FileCheck2,
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 xl:grid-cols-5" aria-label="Attendance statistics">
      {metrics.map((metric, index) => (
        <StatCard key={metric.id} metric={metric} index={index} />
      ))}
    </section>
  )
}
