import {
    generateBoardLayout,
    getFieldLocationByVertex,
    withNewFieldColor,
} from '../../src/lib/board'
import { Field, FieldLocation, PlayerColor } from '../../src/lib/types'

describe('generate a 9x9 board', () => {
    it('should generate 81 fields', () => {
        expect(generateBoardLayout(9).length).toBe(81)
    })
    it('should generate correct vertexes', () => {
        expect(generateBoardLayout(9)[0].vertex).toStrictEqual([1, 1])
        expect(generateBoardLayout(9)[80].vertex).toStrictEqual([9, 9])
    })
})

describe('set new field color', () => {
    it('should set new field color', () => {
        const board: Field[] = [
            {
                vertex: [0, 0],
                color: PlayerColor.EMPTY,
            },
            {
                vertex: [0, 1],
                color: PlayerColor.EMPTY,
            },
        ]
        expect(withNewFieldColor(board, [-1, -1], PlayerColor.BLACK)).toBe(
            board
        )
        expect(
            withNewFieldColor(board, [0, 0], PlayerColor.BLACK)[0].color
        ).toBe(PlayerColor.BLACK)
        expect(
            withNewFieldColor(board, [0, 1], PlayerColor.WHITE)[1].color
        ).toBe(PlayerColor.WHITE)
    })
})

describe('get field location string by vertex', () => {
    it('should generate correct corner locations', () => {
        expect(getFieldLocationByVertex([1, 1], 9)).toStrictEqual(
            FieldLocation.UP_LEFT
        )
        expect(getFieldLocationByVertex([1, 9], 9)).toStrictEqual(
            FieldLocation.UP_RIGHT
        )
        expect(getFieldLocationByVertex([9, 1], 9)).toStrictEqual(
            FieldLocation.DOWN_LEFT
        )
        expect(getFieldLocationByVertex([9, 9], 9)).toStrictEqual(
            FieldLocation.DOWN_RIGHT
        )
    })
    it('should generate correct side locations', () => {
        expect(getFieldLocationByVertex([1, 2], 9)).toStrictEqual(
            FieldLocation.UP
        )
        expect(getFieldLocationByVertex([2, 1], 9)).toStrictEqual(
            FieldLocation.LEFT
        )
        expect(getFieldLocationByVertex([9, 2], 9)).toStrictEqual(
            FieldLocation.DOWN
        )
        expect(getFieldLocationByVertex([2, 9], 9)).toStrictEqual(
            FieldLocation.RIGHT
        )
    })
    it('should generate correct marker locations', () => {
        expect(getFieldLocationByVertex([3, 3], 9)).toStrictEqual(
            FieldLocation.MARKER
        )
        expect(getFieldLocationByVertex([3, 7], 9)).toStrictEqual(
            FieldLocation.MARKER
        )
        expect(getFieldLocationByVertex([5, 5], 9)).toStrictEqual(
            FieldLocation.MARKER
        )
        expect(getFieldLocationByVertex([7, 3], 9)).toStrictEqual(
            FieldLocation.MARKER
        )
        expect(getFieldLocationByVertex([7, 7], 9)).toStrictEqual(
            FieldLocation.MARKER
        )
    })
})
