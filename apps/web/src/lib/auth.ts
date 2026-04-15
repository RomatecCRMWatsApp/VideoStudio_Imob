export interface User {
  id: string
  name: string
  email: string
  plan: string
  credits: number
  company?: string
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, user: User) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}
