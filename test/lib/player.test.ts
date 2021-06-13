import { PlayerColor } from '../../src/lib/types'
import { createPlayer } from '../../src/lib/player'

describe('generate a player', () => {
    it('should generate a valid player', () => {
        const player = createPlayer(0, 1, PlayerColor.BLACK)
        expect(player.userId).toStrictEqual(0)
        expect(player.gameId).toStrictEqual(1)
        expect(player.playerColor).toStrictEqual(PlayerColor.BLACK)
    })
})
