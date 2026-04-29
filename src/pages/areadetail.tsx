import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  createReport,
  getArea,
  getInsights,
  getReports,
} from '../api/power'
import type { Area, Insight, PowerStatus, Report } from '../api/power'

const demoInsight: Insight = {
  today_uptime_hours: 5,
  weekly_trend: [
    { date: '2026-04-23', uptime_hours: 4 },
    { date: '2026-04-24', uptime_hours: 7 },
    { date: '2026-04-25', uptime_hours: 5 },
    { date: '2026-04-26', uptime_hours: 9 },
    { date: '2026-04-27', uptime_hours: 6 },
  ],
  prediction: 'Likely back within 2 hours based on recent reports.',
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'recently'
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const AreaDetail = () => {
  const { id } = useParams()
  const [area, setArea] = useState<Area | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [insight, setInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadArea = async (): Promise<void> => {
      if (!id) return

      setIsLoading(true)
      setError('')

      try {
        const [areaData, reportData, insightData] = await Promise.all([
          getArea(id),
          getReports(id).catch(() => []),
          getInsights(id).catch(() => demoInsight),
        ])

        setArea(areaData)
        setReports(reportData)
        setInsight(insightData)
      } catch (loadError) {
        setArea({
          id,
          name: `Area ${id}`,
          city: 'Lagos',
          current_status: 'OFF',
          last_updated: new Date().toISOString(),
        })
        setReports([])
        setInsight(demoInsight)
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load area detail.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadArea()
  }, [id])

  const maxUptime = useMemo(
    () =>
      Math.max(
        1,
        ...(insight?.weekly_trend.map((item) => item.uptime_hours) ?? [1])
      ),
    [insight]
  )

  const submitReport = async (status: PowerStatus): Promise<void> => {
    if (!area) return

    setIsSubmitting(true)
    setMessage('')

    try {
      const report = await createReport({ area_id: area.id, status })
      setArea({
        ...area,
        current_status: status,
        last_updated: new Date().toISOString(),
      })
      setReports((current) => [report, ...current])
      setMessage(`Power ${status} report submitted for ${area.name}.`)
    } catch (submitError) {
      setMessage(
        submitError instanceof Error
          ? submitError.message
          : 'Could not submit report.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

return (
  <main className="min-h-screen bg-[#f6faf6] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        to="/areafeed"
        className="inline-flex rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-800 transition hover:bg-green-50"
      >
        Back to areas
      </Link>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Backend note: {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-green-100 bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
            Area command
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-green-950 sm:text-5xl">
            {isLoading ? 'Loading area...' : area?.name}
          </h1>

          <p className="mt-3 text-green-900/70">
            {area?.city ?? 'Monitored city'} • Last updated{' '}
            {area ? formatDate(area.last_updated) : 'recently'}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Current
              </p>
              <p
                className={`mt-2 text-3xl font-semibold ${
                  area?.current_status === 'ON'
                    ? 'text-green-700'
                    : 'text-red-600'
                }`}
              >
                {area?.current_status ?? '--'}
              </p>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Today uptime
              </p>
              <p className="mt-2 text-3xl font-semibold text-green-950">
                {insight?.today_uptime_hours ?? 0}h
              </p>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Reports
              </p>
              <p className="mt-2 text-3xl font-semibold text-green-950">
                {reports.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-6">
          <p className="text-xl font-semibold text-green-950">Submit a report</p>
          <p className="mt-2 text-sm text-green-900/70">
            Keep the status fresh for everyone watching this area.
          </p>

          <div className="mt-5 grid gap-3">
            <button
              disabled={isSubmitting || !area}
              onClick={() => void submitReport('ON')}
              className="rounded-xl bg-green-700 px-4 py-4 font-semibold text-white transition hover:bg-green-800 disabled:bg-green-200 disabled:text-green-500"
            >
              Report Power ON
            </button>

            <button
              disabled={isSubmitting || !area}
              onClick={() => void submitReport('OFF')}
              className="rounded-xl border border-green-700 bg-white px-4 py-4 font-semibold text-green-800 transition hover:bg-green-50 disabled:border-green-200 disabled:text-green-400"
            >
              Report Power OFF
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-green-100 bg-white p-6">
          <p className="text-2xl font-semibold text-green-950">Weekly uptime</p>

          <div className="mt-6 space-y-4">
            {insight?.weekly_trend.map((item) => (
              <div key={item.date}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-green-800/70">
                    {new Date(item.date).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-semibold text-green-950">
                    {item.uptime_hours}h
                  </span>
                </div>

                <div className="h-3 rounded-full bg-green-100">
                  <div
                    className="h-3 rounded-full bg-green-600 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (item.uptime_hours / maxUptime) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-900">
            {insight?.prediction}
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-6">
          <p className="text-2xl font-semibold text-green-950">Recent reports</p>

          <div className="mt-5 space-y-3">
            {reports.length === 0 ? (
              <p className="rounded-xl border border-green-100 bg-green-50 p-5 text-sm text-green-800/70">
                No reports yet for this area.
              </p>
            ) : (
              reports.slice(0, 8).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-green-100 bg-[#fcfffc] p-4"
                >
                  <div>
                    <p className="font-semibold text-green-950">
                      {report.user?.name ?? 'Community member'}
                    </p>
                    <p className="mt-1 text-sm text-green-800/70">
                      {formatDate(report.created_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      report.status === 'ON'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  </main>
)

}

export default AreaDetail
