import { calculateDominance } from '../../src/lib/scoring'
import { start, setStone } from '../../src/lib/game'
import { PlayerColor } from '../../src/lib/types'

describe('Dominance Calculation', () => {
    it('should calculate 0% for empty board', () => {
        const board = start() // 9x9 empty
        const dominance = calculateDominance(board)
        
        expect(dominance.black).toBe(0)
        expect(dominance.white).toBe(0)
        expect(dominance.neutral).toBe(81)
        expect(dominance.blackPercentage).toBe(0)
        expect(dominance.whitePercentage).toBe(0)
    })

    it('should calculate 100% black if only one black stone exists', () => {
        let board = start()
        board = setStone(board, { vertex: [5, 5], color: PlayerColor.BLACK })
        
        const dominance = calculateDominance(board)
        
        expect(dominance.black).toBe(81) // 1 stone + 80 territory
        expect(dominance.white).toBe(0)
        expect(dominance.neutral).toBe(0)
        expect(dominance.blackPercentage).toBe(100)
    })

    it('should calculate split board correctly', () => {
        let board = start()
        // Create a wall of black stones at row 5
        for (let col = 1; col <= 9; col++) {
            board = setStone(board, { vertex: [5, col], color: PlayerColor.BLACK })
        }
        
        // Place one white stone at 1,1 (top half)
        board = setStone(board, { vertex: [1, 1], color: PlayerColor.WHITE })

        const dominance = calculateDominance(board)
        
        // Top half (rows 1-4) is 4*9 = 36 points.
        // It has 1 White stone, 35 empty points.
        // The 35 empty points touch White (1,1) AND Black (row 5).
        // So they are Neutral.
        // White score = 1 (stone).
        
        // Bottom half (rows 6-9) is 4*9 = 36 points.
        // They touch ONLY Black (row 5).
        // So they are Black territory.
        // Black score = 9 (wall stones) + 36 (bottom territory) = 45.

        // Neutral = 35 (top empty).

        expect(dominance.white).toBe(1)
        expect(dominance.black).toBe(45)
        expect(dominance.neutral).toBe(35)
        
        // Total = 1 + 45 + 35 = 81. Correct.
    })
})
