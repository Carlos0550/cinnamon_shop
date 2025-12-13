export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'
const ADMIN_TOKEN = (import.meta as any).env?.VITE_ADMIN_TOKEN || ''

async function request<T>(path: string, method: HttpMethod, body?: any): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': ADMIN_TOKEN ? `Bearer ${ADMIN_TOKEN}` : ''
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    let err: any = null
    try { err = await res.json() } catch {}
    throw new Error(err?.error || `http_${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: any) => request<T>(path, 'POST', body),
  patch: <T>(path: string, body?: any) => request<T>(path, 'PATCH', body),
  del: <T>(path: string) => request<T>(path, 'DELETE'),
}
