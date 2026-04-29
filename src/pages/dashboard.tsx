import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAreas, getFollows, getNotifications } from '../api/power'
import type { Area, Follow, Notification } from '../api/power'

const Dashboard = () => {
  const [areas, setAreas] = useState<Area[]>([])
  const [follows, setFollows] = useState<Follow[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadDashboard = async (): Promise<void> => {
      setIsLoading(true)
      setError('')

      try {
        const [areaData, followData, notificationData] = await Promise.all([
          getAreas(),
          getFollows().catch(() => []),
          getNotifications().catch(() => []),
        ])

        setAreas(areaData)
        setFollows(followData)
        setNotifications(notificationData)
      } catch (loadError) {
        setAreas([])
        setFollows([])
        setNotifications([])
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load dashboard data.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const onlineCount = areas.filter((area) => area.current_status === 'ON').length
  const outageCount = areas.filter((area) => area.current_status === 'OFF').length
  const unreadCount = notifications.filter((item) => !item.is_read).length
  const healthScore = useMemo(() => {
    if (areas.length === 0) return 0
    return Math.round((onlineCount / areas.length) * 100)
  }, [areas.length, onlineCount])

  return (
  <main className="page-enter min-h-screen bg-green-50 px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Executive view
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-green-950 sm:text-5xl">
              Grid operations dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-green-900/70">
              A focused summary of area health, watchlist coverage, and user
              notifications across PowerPulse.
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Grid health
            </p>
            <p className="mt-2 text-5xl font-semibold text-green-800">
              {healthScore}%
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900">
          Backend note: {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ['Areas tracked', areas.length, 'bg-white text-green-950'],
          ['Power ON', onlineCount, 'bg-green-700 text-white'],
          ['Outages', outageCount, 'bg-green-100 text-green-900'],
          ['Unread alerts', unreadCount, 'bg-white text-green-950'],
        ].map(([label, value, className], index) => (
          <div
            key={label}
            className={`stagger-item rounded-2xl border border-green-100 p-6 shadow-sm ${className}`}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <p className="text-sm font-semibold uppercase tracking-wide opacity-70">
              {label}
            </p>
            <p className="mt-3 text-4xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-green-950">Watchlist</p>
            <Link
              to="/following"
              className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100"
            >
              Manage
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <p className="rounded-xl border border-green-100 bg-green-50 p-5 text-sm font-medium text-green-700">
                Loading watchlist...
              </p>
            ) : follows.length === 0 ? (
              <p className="rounded-xl border border-green-100 bg-green-50 p-5 text-sm font-medium text-green-700">
                No followed areas yet.
              </p>
            ) : (
              follows.slice(0, 5).map((follow) => (
                <Link
                  key={follow.area.id}
                  to={`/areas/${follow.area.id}`}
                  className="flex items-center justify-between rounded-xl border border-green-100 bg-white p-4 transition hover:border-green-300 hover:bg-green-50/40"
                >
                  <span className="font-semibold text-green-950">
                    {follow.area.name}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      follow.area.current_status === 'ON'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-green-200 text-green-900'
                    }`}
                  >
                    {follow.area.current_status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-green-950">Alerts</p>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {unreadCount} unread
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {notifications.length === 0 ? (
              <p className="rounded-xl border border-green-100 bg-green-50 p-5 text-sm font-medium text-green-700">
                No notifications yet.
              </p>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-4 ${
                    notification.is_read
                      ? 'border-green-100 bg-white'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <p className="font-medium text-green-900">
                    {notification.message}
                  </p>
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

export default Dashboard
