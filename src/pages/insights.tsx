import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { getAreas, getInsights } from '../api/power'
import type { Area, Insight } from '../api/power'

const demoAreas: Area[] = [
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
]

const demoInsight: Insight = {
  today_uptime_hours: 5,
  weekly_trend: [
    { date: '2026-04-23', uptime_hours: 4 },
    { date: '2026-04-24', uptime_hours: 6 },
    { date: '2026-04-25', uptime_hours: 9 },
    { date: '2026-04-26', uptime_hours: 3 },
    { date: '2026-04-27', uptime_hours: 7 },
  ],
  prediction: 'Likely back in 2 hours',
}

const Insights = () => {
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState<string>('')
  const [insight, setInsight] = useState<Insight | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadAreas = async (): Promise<void> => {
      setIsLoading(true)
      setError('')

      try {
        const areaData = await getAreas()
        setAreas(areaData)
        setSelectedAreaId(String(areaData[0]?.id ?? ''))
      } catch (loadError) {
        setAreas(demoAreas)
        setSelectedAreaId(String(demoAreas[0].id))
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load live areas.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadAreas()
  }, [])

  useEffect(() => {
    const loadInsights = async (): Promise<void> => {
      if (!selectedAreaId) return

      try {
        setInsight(await getInsights(selectedAreaId))
      } catch (loadError) {
        setInsight(demoInsight)
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load live insights.'
        )
      }
    }

    void loadInsights()
  }, [selectedAreaId])

  const selectedArea = useMemo(
    () => areas.find((area) => String(area.id) === selectedAreaId),
    [areas, selectedAreaId]
  )

  const maxUptime = useMemo(
    () =>
      Math.max(
        1,
        ...(insight?.weekly_trend.map((item) => item.uptime_hours) ?? [1])
      ),
    [insight]
  )

  const averageUptime = useMemo(() => {
    const trend = insight?.weekly_trend ?? []
    if (trend.length === 0) return 0
    return Math.round(
      trend.reduce((sum, item) => sum + item.uptime_hours, 0) / trend.length
    )
  }, [insight])

return (
  <main className="min-h-screen bg-[#f6faf6] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* HEADER */}
      <section className="rounded-2xl border border-green-100 bg-white p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700">
              Forecasting
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-green-950 sm:text-5xl">
              Power insights
            </h1>

            <p className="mt-3 max-w-xl text-green-900/70">
              Turn raw community reports into uptime trends, operational
              confidence, and simple next-action predictions.
            </p>
          </div>

          <select
            value={selectedAreaId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setSelectedAreaId(event.target.value)
            }
            className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}, {area.city}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Backend note: {error}
        </div>
      )}

      {/* STATS */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          ['Selected area', selectedArea?.name ?? 'Loading'],
          ['Today uptime', `${insight?.today_uptime_hours ?? 0}h`],
          ['Weekly average', `${averageUptime}h`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-green-100 bg-green-50/70 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-950">
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* MAIN CONTENT */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* WEEKLY TREND */}
        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <p className="text-2xl font-semibold text-green-950">
            Weekly trend
          </p>

          <div className="mt-6 flex h-72 items-end gap-3">
            {insight?.weekly_trend.map((item) => (
              <div
                key={item.date}
                className="flex h-full flex-1 flex-col justify-end gap-2"
              >
                <div className="flex flex-1 items-end rounded-xl bg-green-50">
                  <div
                    className="w-full rounded-xl bg-green-600 transition-all duration-500"
                    style={{
                      height: `${Math.max(
                        8,
                        (item.uptime_hours / maxUptime) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-green-950">
                    {item.uptime_hours}h
                  </p>
                  <p className="mt-1 text-xs text-green-700/60">
                    {new Date(item.date).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREDICTION */}
        <div className="rounded-2xl border border-green-100 bg-[#fcfffc] p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Prediction
          </p>

          <p className="mt-4 text-2xl font-semibold text-green-950 leading-snug">
            {insight?.prediction ??
              (isLoading ? 'Loading prediction...' : '')}
          </p>

          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Reliability signal
            </p>
            <p className="mt-1 text-3xl font-semibold text-green-800">
              {Math.min(100, Math.round((averageUptime / 24) * 100))}%
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
)
}

export default Insights
