import { useState } from 'react'
import { Link } from 'react-router-dom'

type PowerStatus = 'ON' | 'OFF'

type FollowedArea = {
  id: string
  name: string
  status: PowerStatus
  lastUpdated: string
}

const initialFollowedAreas: FollowedArea[] = [
  {
    id: 'ikeja',
    name: 'Ikeja',
    status: 'ON',
    lastUpdated: '2 mins ago',
  },
  {
    id: 'yaba',
    name: 'Yaba',
    status: 'OFF',
    lastUpdated: '15 mins ago',
  },
]


//???
const FollowingPage = () => {
  const [followedAreas, setFollowedAreas] =
    useState<FollowedArea[]>(initialFollowedAreas)

  const handleUnfollow = (areaId: string): void => {
    setFollowedAreas((currentAreas) =>
      currentAreas.filter((area) => area.id !== areaId)
    )
  }

  return (
  <main className="min-h-screen bg-[#f6faf6] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <section className="rounded-2xl border border-green-100 bg-white p-6 sm:p-8">
        <p className="text-2xl font-semibold text-green-950">Following</p>
        <p className="mt-1 text-sm text-green-800/70">
          Areas you are currently following.
        </p>
      </section>

      {/* EMPTY STATE */}
      {followedAreas.length === 0 ? (
        <section className="rounded-2xl border border-green-100 bg-white p-6">
          <p className="text-green-900">
            You are not following any areas yet.
          </p>

          <Link
            to="/areafeed"
            className="mt-4 inline-block rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Browse areas
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl border border-green-100 bg-white p-5">
          <div className="grid gap-3">
            {followedAreas.map((area) => (
              <div
                key={area.id}
                className="group flex items-center justify-between gap-4 rounded-xl border border-green-100 bg-[#fcfffc] p-4 transition hover:border-green-300"
              >
                {/* LEFT */}
                <div>
                  <Link to={`/areas/${area.id}`}>
                    <p className="font-semibold text-green-950 group-hover:text-green-700">
                      {area.name}
                    </p>
                  </Link>

                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        area.status === 'ON'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {area.status}
                    </span>

                    <p className="text-sm text-green-800/70">
                      Updated {area.lastUpdated}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <button
                  onClick={() => handleUnfollow(area.id)}
                  className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </main>
)
}

export default FollowingPage