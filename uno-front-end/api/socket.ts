import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null
  
  if (!socketInstance) {
    socketInstance = io('http://localhost:5000', {
      autoConnect: false, // Don't auto-connect, wait for explicit connect() call
      reconnectionAttempts: 3,
    })
    
    // Handle connection errors
    socketInstance.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message)
    })
    
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully')
    })
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
    })
  }
  
  return socketInstance
}

export function connectSocket(): void {
  const socket = getSocket()
  if (socket && !socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket(): void {
  const socket = getSocket()
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

export const socket: Socket | null = typeof window !== 'undefined' ? getSocket() : null

