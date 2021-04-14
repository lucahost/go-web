import { isSuicide } from './game'
import { GameState, Player, PlayerColor } from './types'

describe('Prevent Suicide', () => {
    it('should returns true', () => {
        const board = {
            status: GameState.INITIALIZED,
            captures: [],
            currentPlayer: {
                identifier: '',
                name: '',
                color: PlayerColor.BLACK,
            },
            fields: [],
            height: 9,
            history: [],
            identifier: '',
            pass: false,
            players: [
                {
                    identifier: '',
                    name: '',
                    color: PlayerColor.BLACK,
                },
                {
                    identifier: '',
                    name: '',
                    color: PlayerColor.WHITE,
                },
            ] as [Player, Player],
            width: 9,
        }
        const move = {
            vertex: [0, 0] as [number, number],
            color: PlayerColor.BLACK,
        }
        expect(isSuicide(board, move)).toBeTruthy()
    })
})
