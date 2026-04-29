export type PowerStatus = 'ON' | 'OFF'

export type Area = {
  id: number | string
  name: string
  city: string
  current_status: PowerStatus
  last_updated: string
}

export type Report = {
  id: number | string
  area_id: number | string
  status: PowerStatus
  created_at: string
  user?: {
    name: string
  }
}

export type Follow = {
  id?: number | string
  area_id?: number | string
  area: {
    id: number | string
    name: string
    city?: string
    current_status: PowerStatus
    last_updated?: string
  }
}

export type Notification = {
  id: number | string
  message: string
  is_read: boolean
  created_at: string
}

export type Insight = {
  today_uptime_hours: number
  weekly_trend: Array<{
    date: string
    uptime_hours: number
  }>
  prediction: string
}

export function getAreas(): Promise<Area[]>
export function getArea(areaId: number | string): Promise<Area>
export function createReport(payload: {
  area_id: number | string
  status: PowerStatus
}): Promise<Report>
export function getReports(areaId: number | string): Promise<Report[]>
export function followArea(areaId: number | string): Promise<{
  id: number | string
  area_id: number | string
}>
export function unfollowArea(areaId: number | string): Promise<{
  message: string
}>
export function getFollows(): Promise<Follow[]>
export function getNotifications(): Promise<Notification[]>
export function markNotificationRead(
  notificationId: number | string
): Promise<{
  id: number | string
  is_read: boolean
}>
export function getInsights(areaId: number | string): Promise<Insight>
