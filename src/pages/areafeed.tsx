import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  followArea,
  getAreas,
  getFollows,
  unfollowArea,
} from '../api/power'
import type { Area } from '../api/power'

const REFRESH_INTERVAL_MS = 15000

type PowerStatus = 'ON' | 'OFF'

type AreaFeedItem = {
  id: string
  name: string
  status: PowerStatus
  lastUpdatedLabel: string
  isFollowed: boolean
}

const initialAreas: AreaFeedItem[] = [
  {
    id: 'yaba',
    name: 'Yaba',
    status: 'OFF',
    lastUpdatedLabel: '2 mins ago',
    isFollowed: false,
  },
  {
    id: 'ikeja',
    name: 'Ikeja',
    status: 'ON',
    lastUpdatedLabel: '1 hour ago',
    isFollowed: true,
  },
  {
    id: 'surulere',
    name: 'Surulere',
    status: 'OFF',
    lastUpdatedLabel: '30 mins ago',
    isFollowed: false,
  },
]

const getRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Recently'

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} mins ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}

const mapAreaToFeedItem = (area: Area, followedIds: Set<string>): AreaFeedItem => ({
  id: String(area.id),
  name: area.name,
  status: area.current_status,
  lastUpdatedLabel: getRelativeTime(area.last_updated),
  isFollowed: followedIds.has(String(area.id)),
})

const AreaFeed = () => {
  const navigate = useNavigate()
  const [areas, setAreas] = useState<AreaFeedItem[]>(initialAreas)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  useEffect(() => {
    const fetchAreas = async (): Promise<void> => {
      setIsRefreshing(true)

      try {
        const [areaData, followData] = await Promise.all([
          getAreas(),
          getFollows().catch(() => []),
        ])

        const followedIds = new Set(
          followData.map((follow) => String(follow.area_id ?? follow.area?.id ?? ''))
        )

        setAreas(areaData.map((area) => mapAreaToFeedItem(area, followedIds)))
      } catch (error) {
        console.error(error)
        setAreas(initialAreas)
      } finally {
        setIsRefreshing(false)
      }
    }

    void fetchAreas()

    const intervalId = window.setInterval(() => {
      void fetchAreas()
    }, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [])


  const handleFollow = async (areaId: string): Promise<void> => {
    const existingArea = areas.find((area) => area.id === areaId)
    if (!existingArea) return

    const nextFollowState = !existingArea.isFollowed
    setAreas((currentAreas) =>
      currentAreas.map((area) =>
        area.id === areaId ? { ...area, isFollowed: nextFollowState } : area
      )
    )

    try {
      if (nextFollowState) {
        await followArea(areaId)
      } else {
        await unfollowArea(areaId)
      }
    } catch (error) {
      setAreas((currentAreas) =>
        currentAreas.map((area) =>
          area.id === areaId ? { ...area, isFollowed: existingArea.isFollowed } : area
        )
      )
      console.error(error)
    }
  }

  return (
  <div className="min-h-screen bg-[#f7fbf7] px-6 py-8">
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="border-b border-green-200 pb-4">
        <p className="text-3xl font-semibold text-green-950">Area Feed</p>
        <p className="mt-1 text-sm text-green-800/70">
          {isRefreshing ? 'Refreshing areas...' : 'Live updates active'}
        </p>
      </div>

      <div className="space-y-3">
        {areas.length === 0 ? (
          <div className="rounded-xl border border-green-100 bg-white px-5 py-6 text-center text-green-800/70">
            No areas yet. Try refreshing or check back later.
          </div>
        ) : (
          areas.map((area) => (
            <div
              key={area.id}
              className="group rounded-xl border border-green-100 bg-white px-5 py-4 transition hover:border-green-300 hover:shadow-sm cursor-pointer"
              onClick={() => navigate(`/areas/${area.id}`)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-green-950 group-hover:text-green-700">
                    {area.name}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        area.status === 'ON'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {area.status}
                    </span>

                    <p className="text-sm text-green-800/70">
                      Last updated: {area.lastUpdatedLabel}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleFollow(area.id)
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    area.isFollowed
                      ? 'border border-green-300 bg-white text-green-800 hover:bg-green-50'
                      : 'bg-green-700 text-white hover:bg-green-800'
                  }`}
                >
                  {area.isFollowed ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)

}

export default AreaFeed