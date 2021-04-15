import { generateBoardLayout, withNewFieldColor } from '../../src/lib/board'
import { Field, FieldLocation, PlayerColor } from '../../src/lib/types'

describe('generate a 9x9 board', () => {
    it('should generate 81 fields', () => {
        expect(generateBoardLayout(9).length).toBe(81)
    })
    it('should generate correct vertexes', () => {
        expect(generateBoardLayout(9)[0].vertex).toStrictEqual([1, 1])
        expect(generateBoardLayout(9)[80].vertex).toStrictEqual([9, 9])
    })
    it('should generate correct locations', () => {
        expect(generateBoardLayout(9)[0].location).toStrictEqual(
            FieldLocation.UP_LEFT
        )
        expect(generateBoardLayout(9)[40].location).toStrictEqual(
            FieldLocation.MARKER
        )
        expect(generateBoardLayout(9)[80].location).toStrictEqual(
            FieldLocation.DOWN_RIGHT
        )
    })
})

describe('set new field color', () => {
    it('should set new field color', () => {
        const board: Field[] = [
            {
                vertex: [0, 0],
                location: FieldLocation.UP_RIGHT,
                color: PlayerColor.EMPTY,
            },
            {
                vertex: [0, 1],
                location: FieldLocation.UP,
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
