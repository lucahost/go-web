import { Player, PlayerColor } from './types'

const createPlayer = (name: string, color: PlayerColor): Player => ({
    identifier: 'uuid',
    name,
    color: color,
})
