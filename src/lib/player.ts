import { Player, PlayerColor } from './types'

export const createPlayer = (
    userId: number,
    gameId: number,
    playerColor: PlayerColor
): Player => ({
    userId,
    gameId,
    playerColor,
})
