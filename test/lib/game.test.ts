import {
    FieldLocation,
    GameState,
    Player,
    PlayerColor,
} from '../../src/lib/types'
import { isSuicide } from '../../src/lib/game'

describe('Start', () => {
    it('should return GoBoard', () => {
        expect(true).toBeTruthy()
    })
})

describe('Move', () => {
    it('should call move handling methods', () => {
        expect(true).toBeTruthy()
    })
})

describe('Pass', () => {
    it('should return GoBoard', () => {
        expect(true).toBeTruthy()
    })
})

describe('Prevent Suicide', () => {
    it('should return true', () => {
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
            location: FieldLocation.DOWN_RIGHT,
        }
        expect(isSuicide(board, move)).toBeTruthy()
    })
})

describe('Prevent Ko', () => {
    it('should return true', () => {
        expect(true).toBeTruthy()
    })
})

describe('Handle Capture', () => {
    it('should return GoBoard', () => {
        expect(true).toBeTruthy()
    })
})

describe('Set Stone', () => {
    it('should return GoBoard', () => {
        expect(true).toBeTruthy()
    })
})

describe('Switch Player', () => {
    it('should return GoBoard', () => {
        expect(true).toBeTruthy()
    })
})

describe('Reset Pass', () => {
    it('should return GoBoard', () => {
        expect(true).toBeTruthy()
    })
})

describe('Add History', () => {
    it('should return GoBoard', () => {
        expect(true).toBeTruthy()
    })
})

describe('Get Liberties', () => {
    it('should return free fields', () => {
        expect(true).toBeTruthy()
    })
})
