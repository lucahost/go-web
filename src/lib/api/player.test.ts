import { createPlayer } from './player'
import { PlayerColor } from '../types/player'

describe('Player Tests', () => {
    it('should create a new black player', () => {
        const player = createPlayer('Obi-Wan')
        expect(player.color).toBe(PlayerColor.BLACK)
    })
})
