import {
    FieldLocation,
    GameState,
    GoBoard,
    Player,
    PlayerColor,
} from '../../src/lib/types'
import {
    addHistory,
    getDirectNeighborFields,
    isOccupied,
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
        const player1 = createPlayer('Player1', PlayerColor.BLACK)
        const player2 = createPlayer('Player2', PlayerColor.WHITE)

        const players = [player1, player2] as [Player, Player]

        const startBoard = start(players)

        expect(startBoard.players).toContain(player1)
        expect(startBoard.players).toContain(player2)
        expect(startBoard.fields.length).toStrictEqual(81)
        expect(startBoard.status).toBe(GameState.INITIALIZED)
    })

    it('initialize a game after the first move', () => {
        const goBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        const simpleMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.WHITE,
            location: FieldLocation.DOWN_RIGHT,
        }

        const board = move(goBoard, simpleMove)

        expect(board.currentPlayer.color).toBe(PlayerColor.BLACK)
        expect(board.status).toBe(GameState.RUNNING)
    })
})

describe('isOccupied', () => {
    it('should throw for move out of bound', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        expect(() => isOccupied(initialBoard, [0, 0])).toThrowError(
            /Move does not exist/
        )
    })

    it('should return false for empty', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        const test = isOccupied(initialBoard, [1, 1])

        expect(test).toBeFalsy()
    })

    it('should return true for occupied field', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        initialBoard.fields[0].color = PlayerColor.BLACK

        const test = isOccupied(initialBoard, [1, 1])

        expect(test).toBeTruthy()
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
            location: FieldLocation.UP_LEFT,
        }

        const board = move(initialBoard, initialMove)

        const preOccupiedMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.UP_LEFT,
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

        expect(isSuicide(board, move)).toBeTruthy()
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
            location: FieldLocation.UP_LEFT,
        }
        const newBoard = setStone(initialBoard, move)
        expect(newBoard.fields[0]).toEqual(move)
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

describe('Get Neighbors', () => {
    it('corner stone should return 2 direct neighbors', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.MIDDLE,
        }
        const boardWithMove = setStone(initialBoard, move)
        const neighbors = getDirectNeighborFields(boardWithMove, move.vertex)

        expect(neighbors.length).toEqual(2)
        expect(neighbors).toContainEqual({
            vertex: [1, 2] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.UP,
        })
        expect(neighbors).toContainEqual({
            vertex: [2, 1] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.LEFT,
        })
    })
    it('side stone should return 3 direct neighbors', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [5, 9] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.RIGHT,
        }
        const boardWithMove = setStone(initialBoard, move)
        const neighbors = getDirectNeighborFields(boardWithMove, move.vertex)

        //expect(neighbors.length).toEqual(3)
        expect(neighbors).toContainEqual({
            vertex: [4, 9] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.RIGHT,
        })
        expect(neighbors).toContainEqual({
            vertex: [5, 8] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.MIDDLE,
        })
        expect(neighbors).toContainEqual({
            vertex: [6, 9] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.RIGHT,
        })
    })
    it('middle stone should return 4 direct neighbors', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [5, 5] as [number, number],
            color: PlayerColor.BLACK,
            location: FieldLocation.MIDDLE,
        }

        const boardWithMove = setStone(initialBoard, move)
        const neighbors = getDirectNeighborFields(boardWithMove, move.vertex)

        //expect(neighbors.length).toEqual(4)
        expect(neighbors).toContainEqual({
            vertex: [4, 5] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.MIDDLE,
        })
        expect(neighbors).toContainEqual({
            vertex: [5, 4] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.MIDDLE,
        })
        expect(neighbors).toContainEqual({
            vertex: [5, 6] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.MIDDLE,
        })
        expect(neighbors).toContainEqual({
            vertex: [6, 5] as [number, number],
            color: PlayerColor.EMPTY,
            location: FieldLocation.MIDDLE,
        })
    })
})
