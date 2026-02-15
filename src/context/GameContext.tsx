import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Player, Passage, RoomSettings, PlayerResult, RoomStatus } from '../types'

interface GameState {
  roomCode: string | null
  status: RoomStatus | 'WAITING'
  players: Player[]
  passage: Passage | null
  settings: RoomSettings
  countdown: number | null
  results: PlayerResult[] | null
}

interface GameAction {
  type: string
  payload?: any
}

interface GameContextValue {
  gameState: GameState
  dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

const initialState: GameState = {
  roomCode: null,
  status: 'WAITING', // WAITING | COUNTDOWN | IN_PROGRESS | FINISHED
  players: [],
  passage: null,
  settings: {
    difficulty: 'medium',
    duration: 60,
    category: 'common',
  },
  countdown: null,
  results: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, roomCode: action.payload.roomCode, players: action.payload.players || [] }
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_PLAYERS':
      return { ...state, players: action.payload }
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map((p: Player) =>
          p.userId === action.payload.userId ? { ...p, ...action.payload } : p,
        ),
      }
    case 'SET_PASSAGE':
      return { ...state, passage: action.payload }
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'SET_COUNTDOWN':
      return { ...state, countdown: action.payload }
    case 'SET_RESULTS':
      return { ...state, results: action.payload, status: 'FINISHED' }
    case 'RESET':
      return {
        ...initialState,
        roomCode: state.roomCode,
        players: state.players,
        settings: state.settings,
      }
    default:
      return state
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState as GameState)

  return <GameContext.Provider value={{ gameState, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
