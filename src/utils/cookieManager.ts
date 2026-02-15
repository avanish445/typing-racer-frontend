/**
 * Cookie management utility for handling authentication and theme cookies
 */

interface CookieOptions {
  maxAge?: number // in seconds
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export const cookieManager = {
  /**
   * Set a cookie with the given name and value
   */
  set(name: string, value: string, options: CookieOptions = {}) {
    const defaultSecure =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.hostname !== 'localhost' &&
      window.location.protocol === 'https:'
    const {
      maxAge = 7 * 24 * 60 * 60, // 7 days default
      path = '/',
      secure = defaultSecure,
      sameSite = 'Lax',
    } = options

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    if (maxAge) {
      cookieString += `; Max-Age=${maxAge}`
    }

    if (path) {
      cookieString += `; Path=${path}`
    }

    if (options.domain) {
      cookieString += `; Domain=${options.domain}`
    }

    if (secure) {
      cookieString += '; Secure'
    }

    if (sameSite) {
      cookieString += `; SameSite=${sameSite}`
    }

    document.cookie = cookieString
  },

  /**
   * Get a cookie value by name
   */
  get(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`
    console.log('Getting cookie:', name) // Debug log
    const cookies = document.cookie.split(';')
    console.log('Available cookies:', cookies) // Debug log
    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim()
      if (trimmedCookie.startsWith(nameEQ)) {
        try {
          return decodeURIComponent(trimmedCookie.substring(nameEQ.length))
        } catch {
          return null
        }
      }
    }

    return null
  },

  /**
   * Remove a cookie by name
   */
  delete(name: string) {
    this.set(name, '', { maxAge: -1 })
  },

  /**
   * Set a secure HTTP-only cookie (simulated on client - actual HTTP-only cookies must be set by server)
   * This sets a secure cookie that the server can recognize
   */
  setSecure(name: string, value: string, options: CookieOptions = {}) {
    const defaultSecure =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.hostname !== 'localhost' &&
      window.location.protocol === 'https:'
    this.set(name, value, {
      ...options,
      secure: defaultSecure,
      sameSite: 'Strict',
      maxAge: options.maxAge || 7 * 24 * 60 * 60,
    })
  },
}
