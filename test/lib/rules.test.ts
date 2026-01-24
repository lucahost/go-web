import {
    isInBounds,
    isKo,
    isOccupied,
    isSuicide,
} from '../../src/lib/rules'
import { GoBoard, PlayerColor } from '../../src/lib/types'

import { board as emptyBoard } from '../boards/1_empty_9x9_board.json'
import { board as atariBoard } from '../boards/2_atari_9x9_board.json'
import { board as captureBoard } from '../boards/3_capture_9x9_board.json'
import { board as multiCaptureBoard } from '../boards/4_multi_capture_9x9_board.json'
import { board as suicideBoard } from '../boards/5_suicide_test_board.json'

describe('isInBounds', () => {
    const board = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard
    it('should return true for move in bounds', () => {
         expect(isInBounds(board, { vertex: [1, 1], color: PlayerColor.BLACK })).toBeTruthy()
         expect(isInBounds(board, { vertex: [9, 9], color: PlayerColor.BLACK })).toBeTruthy()
    })
    it('should return false for move out of bounds', () => {
         expect(isInBounds(board, { vertex: [0, 0], color: PlayerColor.BLACK })).toBeFalsy()
         expect(isInBounds(board, { vertex: [10, 1], color: PlayerColor.BLACK })).toBeFalsy()
         expect(isInBounds(board, { vertex: [1, 10], color: PlayerColor.BLACK })).toBeFalsy()
    })
})

describe('isOccupied', () => {
    it('should throw for move out of bound', () => {
        const initialBoard = JSON.parse(JSON.stringify(emptyBoard)) as GoBoard

        expect(() => isOccupied(initialBoard, [0, 0])).toThrow(
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
    const boardAtari = JSON.parse(JSON.stringify(atariBoard)) as GoBoard
    it('should not prevent white move', () => {
        const whiteMove = {
            vertex: [4, 5] as [number, number],
            color: PlayerColor.WHITE,
        }
        expect(boardAtari.history.length).toEqual(7)
        expect(isKo(boardAtari, whiteMove)).toBeFalsy()
    })
    it('should prevent black move after white move', () => {
        // Simulate white move and black capture
        const whiteMoveIndex = boardAtari.fields.findIndex(
            field => field.vertex[0] === 4 && field.vertex[1] === 5
        )
        const blackCaptureIndex = boardAtari.fields.findIndex(
            field => field.vertex[0] === 5 && field.vertex[1] === 5
        )
        boardAtari.fields[whiteMoveIndex] = {
            ...boardAtari.fields[whiteMoveIndex],
            color: PlayerColor.WHITE,
        }
        boardAtari.fields[blackCaptureIndex] = {
            ...boardAtari.fields[blackCaptureIndex],
            color: PlayerColor.EMPTY,
        }
        boardAtari.history.push({ vertex: [4, 5], color: PlayerColor.WHITE })
        boardAtari.captures.push({ vertex: [5, 5], color: PlayerColor.BLACK })
        expect(boardAtari.history.length).toEqual(8)
        expect(boardAtari.captures.length).toEqual(1)
        expect(boardAtari.fields[whiteMoveIndex].color).toEqual(
            PlayerColor.WHITE
        )
        expect(boardAtari.fields[blackCaptureIndex].color).toEqual(
            PlayerColor.EMPTY
        )

        // Test black move ko
        const blackMove = {
            vertex: [5, 5] as [number, number],
            color: PlayerColor.BLACK,
        }
        expect(isKo(boardAtari, blackMove)).toBeTruthy()
    })
})
