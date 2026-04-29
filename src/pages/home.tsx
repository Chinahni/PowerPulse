import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  createReport,
  getAreas,
  getNotifications,
  markNotificationRead,
} from '../api/power'
import type { Area, Notification, PowerStatus } from '../api/power'

const fallbackAreas: Area[] = [
  {
    id: 1,
    name: 'Yaba',
    city: 'Lagos',
    current_status: 'OFF',
    last_updated: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Ikeja',
    city: 'Lagos',
    current_status: 'ON',
    last_updated: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Lekki',
    city: 'Lagos',
    current_status: 'ON',
    last_updated: new Date().toISOString(),
  },
]

const fallbackNotifications: Notification[] = [
  {
    id: 'demo-1',
    message: 'Ikeja has fresh power reports from nearby users.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    message: 'Yaba is trending unstable this afternoon.',
    is_read: true,
    created_at: new Date().toISOString(),
  },
]

const formatTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getUserName = (): string => {
  try {
    const user = localStorage.getItem('user')
    if (!user) return 'there'
    return JSON.parse(user).name || 'there'
  } catch {
    return 'there'
  }
}

const Home = () => {
  const [areas, setAreas] = useState<Area[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [notice, setNotice] = useState<string>('')
  const [apiWarning, setApiWarning] = useState<string>('')

  useEffect(() => {
    const loadHome = async (): Promise<void> => {
      setIsLoading(true)
      setApiWarning('')

      try {
        const [areaData, notificationData] = await Promise.all([
          getAreas(),
          getNotifications().catch(() => []),
        ])

        setAreas(areaData)
        setNotifications(notificationData)
        setSelectedAreaId(String(areaData[0]?.id ?? ''))
      } catch (error) {
        setAreas(fallbackAreas)
        setNotifications(fallbackNotifications)
        setSelectedAreaId(String(fallbackAreas[0].id))
        setApiWarning(
          error instanceof Error
            ? error.message
            : 'Live data is unavailable, showing a polished demo view.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadHome()
  }, [])

  const selectedArea = useMemo(
    () => areas.find((area) => String(area.id) === selectedAreaId),
    [areas, selectedAreaId]
  )

  const onlineCount = areas.filter((area) => area.current_status === 'ON').length
  const outageCount = areas.length - onlineCount
  const unreadCount = notifications.filter((item) => !item.is_read).length

  const submitReport = async (status: PowerStatus): Promise<void> => {
    if (!selectedArea) return

    setIsSubmitting(true)
    setNotice('')

    try {
      await createReport({ area_id: selectedArea.id, status })
      setAreas((currentAreas) =>
        currentAreas.map((area) =>
          String(area.id) === String(selectedArea.id)
            ? {
                ...area,
                current_status: status,
                last_updated: new Date().toISOString(),
              }
            : area
        )
      )
      setNotice(`Power ${status} report submitted for ${selectedArea.name}.`)
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Could not submit the report. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const readNotification = async (notification: Notification): Promise<void> => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    )

    if (String(notification.id).startsWith('demo-')) return

    try {
      await markNotificationRead(notification.id)
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: false } : item
        )
      )
    }
  }

  return (
  <main className="min-h-screen bg-[#f6faf6] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-green-100 bg-white">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Live grid desk
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-green-950 sm:text-5xl">
              Good day, {getUserName()}. 
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-green-900/70">
              Report outages, follow area recovery, and act on live
              notifications from one focused operations view.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['Tracked areas', areas.length],
                ['Power online', onlineCount],
                ['Outage watch', outageCount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-green-100 bg-green-50/70 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-green-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-[#fcfffc] p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Quick report
            </p>

            <label
              htmlFor="selectedArea"
              className="mt-4 block text-sm font-medium text-green-900"
            >
              Area
            </label>

            <select
              id="selectedArea"
              value={selectedAreaId}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setSelectedAreaId(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}, {area.city}
                </option>
              ))}
            </select>

            <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm text-green-700">Current status</p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  selectedArea?.current_status === 'ON'
                    ? 'text-green-700'
                    : 'text-red-600'
                }`}
              >
                {selectedArea?.current_status ?? 'Loading'}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                disabled={isSubmitting || !selectedArea}
                onClick={() => void submitReport('ON')}
                className="rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:bg-green-200 disabled:text-green-500"
              >
                Power ON
              </button>

              <button
                disabled={isSubmitting || !selectedArea}
                onClick={() => void submitReport('OFF')}
                className="rounded-xl border border-green-700 bg-white px-4 py-3 font-semibold text-green-800 transition hover:bg-green-50 disabled:border-green-200 disabled:text-green-400"
              >
                Power OFF
              </button>
            </div>

            {notice && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {notice}
              </p>
            )}
          </div>
        </div>
      </section>

      {apiWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Backend note: {apiWarning}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-green-950">Area board</p>
              <p className="mt-1 text-sm text-green-800/70">
                {isLoading ? 'Loading live area status...' : 'Live area status'}
              </p>
            </div>

            <Link
              to="/areafeed"
              className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {areas.slice(0, 5).map((area) => (
              <Link
                key={area.id}
                to={`/areas/${area.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-green-100 bg-[#fcfffc] p-4 transition hover:border-green-300"
              >
                <div>
                  <p className="font-semibold text-green-950 group-hover:text-green-700">
                    {area.name}
                  </p>
                  <p className="mt-1 text-sm text-green-800/70">
                    {area.city} • Updated {formatTime(area.last_updated)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    area.current_status === 'ON'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {area.current_status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-green-950">
                Notifications
              </p>
              <p className="mt-1 text-sm text-green-800/70">
                {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Live
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <button
                key={notification.id}
                onClick={() => void readNotification(notification)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  notification.is_read
                    ? 'border-green-100 bg-white text-green-800/70'
                    : 'border-green-200 bg-green-50 text-green-950'
                }`}
              >
                <p className="font-medium">{notification.message}</p>
                <p className="mt-2 text-xs text-green-700/60">
                  {formatTime(notification.created_at)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  </main>
)

}

export default Home
