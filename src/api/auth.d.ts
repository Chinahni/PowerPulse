export type RegisterPayload = {
  name: string
  email: string
  password: string
  area_id: number
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthUser = {
  id: number | string
  name: string
  email: string
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

export function registerUser(payload: RegisterPayload): Promise<AuthResponse>
export function loginUser(payload: LoginPayload): Promise<AuthResponse>
