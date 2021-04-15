import { Player, PlayerColor } from './types'

export const createPlayer = (name: string, color: PlayerColor): Player => ({
    identifier: 'uuid',
    name,
    color: color,
})
