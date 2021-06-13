import { Player, PlayerColor } from './types'

export const createPlayer = (name: string, color: PlayerColor): Player => ({
    userId: 1,
    gameId: 1,
    playerColor: color,
})
