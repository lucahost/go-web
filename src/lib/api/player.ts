import { Player, PlayerColor } from '../types/player'

export const createPlayer = (name: string): Player => {
    return {
        name,
        color: PlayerColor.BLACK,
    }
}
