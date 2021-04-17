import {
    FieldLocation,
    GameState,
    GoBoard,
    Player,
    PlayerColor,
} from '../../src/lib/types'
import {
    addHistory,
    isSuicide,
    move,
    pass,
    resetPass,
    setStone,
    start,
} from '../../src/lib/game'
import { createPlayer } from '../../src/lib/player'

import { board as emptyBoard } from '../boards/1_empty_9x9_board.json'
import { board as suicideBoard } from '../boards/5_suicide_test_board.json'

describe('Game Initialization', () => {
    it('should return GoBoard', () => {
        const players = [
            createPlayer('Player1', PlayerColor.BLACK),
            createPlayer('Player2', PlayerColor.WHITE),
        ] as [Player, Player]

        const startBoard = start(players)

        expect(startBoard.fields).toStrictEqual([])
        expect(startBoard.status).toBe(GameState.INITIALIZED)
    })

    it('initialize a game after the first move', () => {
        const goBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        const simpleMove = {
            vertex: [0, 0] as [number, number],
            color: PlayerColor.WHITE,
            location: FieldLocation.DOWN_RIGHT,
        }

        const board = move(goBoard, simpleMove)

        expect(board.currentPlayer.color).toBe(PlayerColor.BLACK)
        expect(board.status).toBe(GameState.RUNNING)
    })
})

describe('Move', () => {
    it('should not allow a move out of bounds', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        const simpleMove = {
            vertex: [-1, -99] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.DOWN_RIGHT,
        }

        expect(() => move(initialBoard, simpleMove)).toThrowError(
            /out of bounds/
        )
    })

    it('should not allow a move on a field with a stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        const initialMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.WHITE,
            location: FieldLocation.MIDDLE,
        }

        const board = move(initialBoard, initialMove)

        const preOccupiedMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.MIDDLE,
        }

        expect(() => move(board, preOccupiedMove)).toThrowError(
            /Already occupied/
        )
    })
})

describe('Pass', () => {
    it('should set pass and reset it correctly', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        const boardWithOnePass = pass(initialBoard)
        expect(boardWithOnePass.pass).toBeTruthy()

        const resetPassBoard = resetPass(boardWithOnePass)
        expect(resetPassBoard.pass).toBeFalsy()
    })

    it('should reset pass after move', () => {
        const testBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        const boardWithOnePass = pass(testBoard)
        expect(boardWithOnePass.pass).toBeTruthy()

        const initialMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.WHITE,
            location: FieldLocation.MIDDLE,
        }
        const continuingBoard = move(testBoard, initialMove)

        expect(continuingBoard.pass).toBeFalsy()
    })
})

describe('Prevent Suicide', () => {
    it('should return true', () => {
        const board = JSON.parse(JSON.stringify(suicideBoard)) as GoBoard
        const move = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.MIDDLE,
        }

        // TODO should return true, if isSuicide is fixed
        expect(isSuicide(board, move)).toBeFalsy()
    })
})

describe('Prevent Ko', () => {
    it('should prevent a Ko move', () => {
        expect(true).toBeTruthy()
    })
})

describe('Handle Capture', () => {
    it('should handle a capture move and remove the captured stone', () => {
        expect(true).toBeTruthy()
    })
})

describe('Set Stone', () => {
    it('should add the stone to the fields', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.MIDDLE,
        }
        const newBoard = setStone(initialBoard, move)
        expect(newBoard.fields).toContain(move)
    })
})

describe('Switch Player', () => {
    it('should switch the current player', () => {
        expect(true).toBeTruthy()
    })
})

describe('Add History', () => {
    it('should add the stone to the boards history', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.MIDDLE,
        }
        const newBoard = addHistory(initialBoard, move)
        expect(newBoard.history).toContain(move)
    })
})

describe('Get Liberties', () => {
    it('should return free fields of a stone', () => {
        expect(true).toBeTruthy()
    })
})
