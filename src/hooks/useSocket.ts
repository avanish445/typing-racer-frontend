import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { cookieManager } from '../utils/cookieManager'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5005'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = cookieManager.get('accessToken')
    const socketInstance: Socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
    })
    socketRef.current = socketInstance

    socketInstance.on('connect', () => setConnected(true))
    socketInstance.on('disconnect', () => setConnected(false))

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const connect = useCallback(() => {
    socketRef.current?.connect()
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback(<T = any>(event: string, handler: (data: T) => void) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }, [])

  return { socket: socketRef.current, connected, connect, disconnect, emit, on }
}
