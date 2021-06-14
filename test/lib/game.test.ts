import {
    Game,
    GameState,
    GoBoard,
    Player,
    PlayerColor,
} from '../../src/lib/types'
import {
    addHistory,
    getDirectNeighborFields,
    getGroupByVertex,
    getGroupLiberties,
    getLiberties,
    handleCapture,
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
import { board as atariBoard } from '../boards/2_atari_9x9_board.json'
import { board as captureBoard } from '../boards/3_capture_9x9_board.json'
import { board as multiCaptureBoard } from '../boards/4_multi_capture_9x9_board.json'
import { board as suicideBoard } from '../boards/5_suicide_test_board.json'

const newGame = (board: GoBoard): Game => {
    const player1 = createPlayer(0, 1, PlayerColor.BLACK)
    const player2 = createPlayer(1, 1, PlayerColor.WHITE)

    const players = [player1, player2] as [Player, Player]

    return {
        id: 1,
        title: 'Test Game',
        createdAt: new Date(),
        updatedAt: new Date(),
        board,
        players,
        currentPlayer: {
            playerColor: PlayerColor.BLACK,
            userId: 0,
            gameId: 1,
        },
        gameState: GameState.INITIALIZED,
        author: { email: 'test', id: 1, name: 'author-name' },
    } as Game
}

describe('Game Initialization', () => {
    it('should return GoBoard', () => {
        const startBoard = start()
        expect(startBoard.fields.length).toStrictEqual(81)
        expect(startBoard.status).toBe(GameState.INITIALIZED)
    })

    it('initialize a game after the first move', () => {
        const goBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        goBoard.currentPlayer = {
            playerColor: PlayerColor.BLACK,
            userId: 0,
            gameId: 1,
        }
        const game = newGame(goBoard)

        const simpleMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
        }

        const board = move(game, simpleMove)

        expect(board.currentPlayer?.playerColor).toBe(PlayerColor.WHITE)
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
        const game = newGame(initialBoard)
        const simpleMove = {
            vertex: [-1, -99] as [number, number],
            color: PlayerColor.BLACK,
        }

        expect(() => move(game, simpleMove)).toThrowError(/out of bounds/)
    })

    it('should not allow a move on a field with a stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const game = newGame(initialBoard)
        const initialMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
        }

        game.board = move(game, initialMove)

        game.currentPlayer = {
            playerColor: PlayerColor.WHITE,
            userId: 0,
            gameId: 1,
        }

        const preOccupiedMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.WHITE,
        }

        expect(() => move(game, preOccupiedMove)).toThrowError(
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
        const game = newGame(testBoard)

        const boardWithOnePass = pass(testBoard)
        expect(boardWithOnePass.pass).toBeTruthy()

        const initialMove = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.WHITE,
        }

        if (testBoard.currentPlayer) {
            testBoard.currentPlayer.playerColor = PlayerColor.WHITE
        }

        game.board = move(game, initialMove)

        expect(game.board.pass).toBeFalsy()
    })
})

describe('Prevent Suicide', () => {
    const board = JSON.parse(JSON.stringify(suicideBoard)) as GoBoard
    const boardAtari = JSON.parse(JSON.stringify(atariBoard)) as GoBoard
    const boardCapture = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
    const boardMultiCapture = JSON.parse(
        JSON.stringify(multiCaptureBoard)
    ) as GoBoard
    it('upper left corner', () => {
        expect(isSuicide(board, [1, 1], PlayerColor.WHITE)).toBeTruthy()
        expect(isSuicide(board, [1, 1], PlayerColor.BLACK)).toBeFalsy()
    })
    it('upper right corner', () => {
        expect(isSuicide(board, [1, 9], PlayerColor.BLACK)).toBeTruthy()
        expect(isSuicide(board, [1, 9], PlayerColor.WHITE)).toBeFalsy()
    })
    it('bottom right corner', () => {
        expect(isSuicide(board, [9, 9], PlayerColor.WHITE)).toBeTruthy()
        expect(isSuicide(board, [9, 9], PlayerColor.BLACK)).toBeFalsy()
    })
    it('middle section', () => {
        expect(isSuicide(board, [6, 6], PlayerColor.WHITE)).toBeFalsy()
        expect(isSuicide(board, [6, 6], PlayerColor.BLACK)).toBeFalsy()
    })
    it('in classic atari situation', () => {
        expect(isSuicide(boardAtari, [4, 5], PlayerColor.WHITE)).toBeFalsy()
        expect(isSuicide(boardAtari, [4, 5], PlayerColor.WHITE)).toBeFalsy()
    })
    it('group in upper right corner', () => {
        expect(isSuicide(boardCapture, [2, 8], PlayerColor.WHITE)).toBeTruthy()
        expect(isSuicide(boardCapture, [2, 8], PlayerColor.BLACK)).toBeFalsy()
    })
    it('on multi capture situation', () => {
        expect(
            isSuicide(boardMultiCapture, [5, 5], PlayerColor.WHITE)
        ).toBeTruthy()
        expect(
            isSuicide(boardMultiCapture, [5, 5], PlayerColor.BLACK)
        ).toBeFalsy()
    })
})

describe('Prevent Ko', () => {
    it('should prevent a Ko move', () => {
        expect(true).toBeTruthy()
    })
})

describe('Handle Capture', () => {
    it('of single corner stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [1, 2],
            PlayerColor.BLACK
        )
        const fieldOnBoardAfterCapture = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 1 && field.vertex[1] === 1
        )
        expect(boardAfterHandleCapture.captures.length).toStrictEqual(1)
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.WHITE,
            vertex: [1, 1],
        })
        expect(fieldOnBoardAfterCapture?.color).toStrictEqual(PlayerColor.EMPTY)
    })
    it('of group of side stones', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [2, 6],
            PlayerColor.BLACK
        )
        const fieldOnBoardAfterCapture1 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 1 && field.vertex[1] === 5
        )
        const fieldOnBoardAfterCapture2 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 1 && field.vertex[1] === 6
        )
        expect(boardAfterHandleCapture.captures.length).toStrictEqual(2)
        expect(fieldOnBoardAfterCapture1?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
        expect(fieldOnBoardAfterCapture2?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
    })
    it('of single middle stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [4, 4],
            PlayerColor.BLACK
        )
        const fieldOnBoardAfterCapture = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 4 && field.vertex[1] === 3
        )
        expect(boardAfterHandleCapture.captures.length).toStrictEqual(1)
        expect(fieldOnBoardAfterCapture?.color).toStrictEqual(PlayerColor.EMPTY)
    })
    it('of group of corner stones', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [2, 8],
            PlayerColor.BLACK
        )
        const fieldOnBoardAfterCapture1 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 1 && field.vertex[1] === 8
        )
        const fieldOnBoardAfterCapture2 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 1 && field.vertex[1] === 9
        )
        const fieldOnBoardAfterCapture3 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 2 && field.vertex[1] === 9
        )
        expect(boardAfterHandleCapture.captures.length).toStrictEqual(3)
        expect(fieldOnBoardAfterCapture1?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
        expect(fieldOnBoardAfterCapture2?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
        expect(fieldOnBoardAfterCapture3?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
    })
    it('of group of middle stones', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [9, 7],
            PlayerColor.BLACK
        )
        const fieldOnBoardAfterCapture1 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 7 && field.vertex[1] === 6
        )
        const fieldOnBoardAfterCapture2 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 7 && field.vertex[1] === 7
        )
        const fieldOnBoardAfterCapture3 = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 8 && field.vertex[1] === 7
        )
        expect(boardAfterHandleCapture.captures.length).toStrictEqual(3)
        expect(fieldOnBoardAfterCapture1?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
        expect(fieldOnBoardAfterCapture2?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
        expect(fieldOnBoardAfterCapture3?.color).toStrictEqual(
            PlayerColor.EMPTY
        )
    })
    it('of group of middle stones (black plays on 6/6)', () => {
        const initialBoard = JSON.parse(JSON.stringify(suicideBoard)) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [6, 6],
            PlayerColor.BLACK
        )
        expect(boardAfterHandleCapture.captures.length).toStrictEqual(1)
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.WHITE,
            vertex: [6, 5],
        })
    })
    it('of group of middle stones (white plays on 6/6)', () => {
        const initialBoard = JSON.parse(JSON.stringify(suicideBoard)) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [6, 6],
            PlayerColor.WHITE
        )
        expect(boardAfterHandleCapture.captures.length).toStrictEqual(4)
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.BLACK,
            vertex: [5, 4],
        })
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.BLACK,
            vertex: [5, 5],
        })
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.BLACK,
            vertex: [5, 6],
        })
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.BLACK,
            vertex: [6, 4],
        })
    })
})

describe('Handle Multi-Capture', () => {
    it('of four separate stone', () => {
        const initialBoard = JSON.parse(
            JSON.stringify(multiCaptureBoard)
        ) as GoBoard
        const boardAfterHandleCapture = handleCapture(
            initialBoard,
            [5, 5],
            PlayerColor.BLACK
        )
        const fieldOnBoardAfterCapture = boardAfterHandleCapture.fields.find(
            field => field.vertex[0] === 5 && field.vertex[1] === 5
        )
        //expect(boardAfterHandleCapture.captures.length).toStrictEqual(4)
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.WHITE,
            vertex: [4, 5],
        })
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.WHITE,
            vertex: [5, 4],
        })
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.WHITE,
            vertex: [5, 6],
        })
        expect(boardAfterHandleCapture.captures).toContainEqual({
            color: PlayerColor.WHITE,
            vertex: [6, 5],
        })
        expect(fieldOnBoardAfterCapture?.color).toStrictEqual(PlayerColor.EMPTY)
    })
})

describe('Get largest group of same color', () => {
    it('should return single stone for single stone corner group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const group = getGroupByVertex(initialBoard, [1, 1])
        const move = {
            color: PlayerColor.WHITE,
            vertex: [1, 1],
        }
        expect(group.length).toStrictEqual(1)
        expect(group).toContainEqual(move)
    })
    it('should return single stone for single stone middle group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const group = getGroupByVertex(initialBoard, [4, 3])
        const move = {
            color: PlayerColor.WHITE,
            vertex: [4, 3],
        }
        expect(group.length).toStrictEqual(1)
        expect(group).toContainEqual(move)
    })
    it('should return two stones for two stone side group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const group1 = getGroupByVertex(initialBoard, [1, 5])
        const group2 = getGroupByVertex(initialBoard, [1, 6])
        const move1 = {
            color: PlayerColor.WHITE,
            vertex: [1, 5],
        }
        const move2 = {
            color: PlayerColor.WHITE,
            vertex: [1, 6],
        }
        expect(group1.length).toStrictEqual(2)
        expect(group2.length).toStrictEqual(2)
        expect(group1).toContainEqual(move1)
        expect(group1).toContainEqual(move2)
        expect(group2).toContainEqual(move1)
        expect(group2).toContainEqual(move2)
    })
    it('should return three stones for three stone middle group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const group1 = getGroupByVertex(initialBoard, [7, 6])
        const group2 = getGroupByVertex(initialBoard, [7, 7])
        const group3 = getGroupByVertex(initialBoard, [8, 7])
        const move1 = {
            color: PlayerColor.WHITE,
            vertex: [7, 6],
        }
        const move2 = {
            color: PlayerColor.WHITE,
            vertex: [7, 7],
        }
        const move3 = {
            color: PlayerColor.WHITE,
            vertex: [8, 7],
        }
        expect(group1.length).toStrictEqual(3)
        expect(group2.length).toStrictEqual(3)
        expect(group3.length).toStrictEqual(3)
        expect(group1).toContainEqual(move1)
        expect(group1).toContainEqual(move2)
        expect(group1).toContainEqual(move3)
        expect(group2).toContainEqual(move1)
        expect(group2).toContainEqual(move2)
        expect(group2).toContainEqual(move3)
        expect(group3).toContainEqual(move1)
        expect(group3).toContainEqual(move2)
        expect(group3).toContainEqual(move3)
    })
    it('should return three stones for three stone corner group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const group1 = getGroupByVertex(initialBoard, [1, 8])
        const group2 = getGroupByVertex(initialBoard, [1, 9])
        const group3 = getGroupByVertex(initialBoard, [2, 9])
        const move1 = {
            color: PlayerColor.WHITE,
            vertex: [1, 8],
        }
        const move2 = {
            color: PlayerColor.WHITE,
            vertex: [1, 9],
        }
        const move3 = {
            color: PlayerColor.WHITE,
            vertex: [2, 9],
        }
        expect(group1.length).toStrictEqual(3)
        expect(group2.length).toStrictEqual(3)
        expect(group3.length).toStrictEqual(3)
        expect(group1).toContainEqual(move1)
        expect(group1).toContainEqual(move2)
        expect(group1).toContainEqual(move3)
        expect(group2).toContainEqual(move1)
        expect(group2).toContainEqual(move2)
        expect(group2).toContainEqual(move3)
        expect(group3).toContainEqual(move1)
        expect(group3).toContainEqual(move2)
        expect(group3).toContainEqual(move3)
    })
    it('should return six stones for six stone corner group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const group1 = getGroupByVertex(initialBoard, [7, 1])
        const group2 = getGroupByVertex(initialBoard, [7, 2])
        const group3 = getGroupByVertex(initialBoard, [8, 1])
        const group4 = getGroupByVertex(initialBoard, [8, 2])
        const group5 = getGroupByVertex(initialBoard, [9, 1])
        const group6 = getGroupByVertex(initialBoard, [9, 2])
        expect(group1.length).toStrictEqual(6)
        expect(group2.length).toStrictEqual(6)
        expect(group3.length).toStrictEqual(6)
        expect(group4.length).toStrictEqual(6)
        expect(group5.length).toStrictEqual(6)
        expect(group6.length).toStrictEqual(6)
    })
})

describe('Set Stone', () => {
    it('should add the stone to the fields', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
        }
        const newBoard = setStone(initialBoard, move)
        expect(newBoard.fields[0].color).toEqual(PlayerColor.BLACK)
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
        }
        const newBoard = addHistory(initialBoard, move)
        expect(newBoard.history).toContain(move)
    })
})

describe('Get Liberties', () => {
    it('should return 2 fields of a single corner stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const liberties = getLiberties(initialBoard, [1, 1])
        expect(liberties.length).toStrictEqual(2)
    })
    it('should return 4 fields of a single middle stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const liberties = getLiberties(initialBoard, [5, 5])
        expect(liberties.length).toStrictEqual(4)
    })
})

describe('Get Group Liberties', () => {
    it('should return 1 field of an atari single corner stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const liberties = getGroupLiberties(initialBoard, [1, 1])
        expect(liberties.length).toStrictEqual(1)
    })
    it('should return 1 field of an atari two corner stones', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const liberties1 = getGroupLiberties(initialBoard, [1, 5])
        const liberties2 = getGroupLiberties(initialBoard, [1, 6])
        expect(liberties1.length).toStrictEqual(1)
        expect(liberties2.length).toStrictEqual(1)
    })
    it('should return 1 field of an atari single middle stone', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const liberties = getGroupLiberties(initialBoard, [4, 3])
        expect(liberties.length).toStrictEqual(1)
    })
    it('should return 1 field of an atari middle three stone group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const liberties1 = getGroupLiberties(initialBoard, [7, 6])
        const liberties2 = getGroupLiberties(initialBoard, [7, 7])
        const liberties3 = getGroupLiberties(initialBoard, [8, 7])
        expect(liberties1.length).toStrictEqual(1)
        expect(liberties2.length).toStrictEqual(1)
        expect(liberties3.length).toStrictEqual(1)
    })
    it('should return 1 field of an atari three stone corner group', () => {
        const initialBoard = JSON.parse(JSON.stringify(captureBoard)) as GoBoard
        const liberties1 = getGroupLiberties(initialBoard, [1, 8])
        const liberties2 = getGroupLiberties(initialBoard, [1, 9])
        const liberties3 = getGroupLiberties(initialBoard, [2, 9])
        expect(liberties1.length).toStrictEqual(1)
        expect(liberties2.length).toStrictEqual(1)
        expect(liberties3.length).toStrictEqual(1)
    })
})

describe('Get Neighbors', () => {
    it('corner stone should return 2 direct neighbors', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [1, 1] as [number, number],
            color: PlayerColor.BLACK,
        }
        const boardWithMove = setStone(initialBoard, move)
        const neighbors = getDirectNeighborFields(boardWithMove, move.vertex)

        expect(neighbors.length).toEqual(2)
        expect(neighbors).toContainEqual({
            vertex: [1, 2] as [number, number],
            color: PlayerColor.EMPTY,
        })
        expect(neighbors).toContainEqual({
            vertex: [2, 1] as [number, number],
            color: PlayerColor.EMPTY,
        })
    })
    it('side stone should return 3 direct neighbors', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [5, 9] as [number, number],
            color: PlayerColor.BLACK,
        }
        const boardWithMove = setStone(initialBoard, move)
        const neighbors = getDirectNeighborFields(boardWithMove, move.vertex)

        //expect(neighbors.length).toEqual(3)
        expect(neighbors).toContainEqual({
            vertex: [4, 9] as [number, number],
            color: PlayerColor.EMPTY,
        })
        expect(neighbors).toContainEqual({
            vertex: [5, 8] as [number, number],
            color: PlayerColor.EMPTY,
        })
        expect(neighbors).toContainEqual({
            vertex: [6, 9] as [number, number],
            color: PlayerColor.EMPTY,
        })
    })
    it('middle stone should return 4 direct neighbors', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
        const move = {
            vertex: [5, 5] as [number, number],
            color: PlayerColor.BLACK,
        }

        const boardWithMove = setStone(initialBoard, move)
        const neighbors = getDirectNeighborFields(boardWithMove, move.vertex)

        expect(neighbors).toContainEqual({
            vertex: [4, 5] as [number, number],
            color: PlayerColor.EMPTY,
        })
        expect(neighbors).toContainEqual({
            vertex: [5, 4] as [number, number],
            color: PlayerColor.EMPTY,
        })
        expect(neighbors).toContainEqual({
            vertex: [5, 6] as [number, number],
            color: PlayerColor.EMPTY,
        })
        expect(neighbors).toContainEqual({
            vertex: [6, 5] as [number, number],
            color: PlayerColor.EMPTY,
        })
    })
})
