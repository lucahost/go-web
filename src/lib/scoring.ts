import { GoBoard, PlayerColor, Vertex } from './types'
import { getDirectNeighborFields } from './game'

export interface Dominance {
    black: number
    white: number
    neutral: number
    blackPercentage: number
    whitePercentage: number
}

export const calculateDominance = (board: GoBoard): Dominance => {
    const visited = new Set<string>()
    let blackScore = 0
    let whiteScore = 0
    let neutralScore = 0

    const totalPoints = board.width * board.height

    for (const field of board.fields) {
        if (field.color === PlayerColor.BLACK) {
            blackScore++
        } else if (field.color === PlayerColor.WHITE) {
            whiteScore++
        } else {
            // Empty field
            const vertexKey = `${field.vertex[0]},${field.vertex[1]}`
            if (visited.has(vertexKey)) {
                continue
            }

            // Start flood fill for this empty region
            const { region, touchingColors } = analyzeRegion(board, field.vertex, visited)
            
            if (touchingColors.has(PlayerColor.BLACK) && !touchingColors.has(PlayerColor.WHITE)) {
                blackScore += region.length
            } else if (touchingColors.has(PlayerColor.WHITE) && !touchingColors.has(PlayerColor.BLACK)) {
                whiteScore += region.length
            } else {
                neutralScore += region.length
            }
        }
    }

    return {
        black: blackScore,
        white: whiteScore,
        neutral: neutralScore,
        blackPercentage: Math.round((blackScore / totalPoints) * 100),
        whitePercentage: Math.round((whiteScore / totalPoints) * 100)
    }
}

const analyzeRegion = (
    board: GoBoard, 
    startVertex: Vertex, 
    visited: Set<string>
): { region: Vertex[], touchingColors: Set<PlayerColor> } => {
    const region: Vertex[] = []
    const touchingColors = new Set<PlayerColor>()
    const queue: Vertex[] = [startVertex]
    
    // Mark start as visited immediately to avoid re-queueing
    const startKey = `${startVertex[0]},${startVertex[1]}`
    visited.add(startKey)

    while (queue.length > 0) {
        const currentVertex = queue.shift()!
        region.push(currentVertex)

        const neighbors = getDirectNeighborFields(board, currentVertex)

        for (const neighbor of neighbors) {
            if (neighbor.color === PlayerColor.EMPTY) {
                const neighborKey = `${neighbor.vertex[0]},${neighbor.vertex[1]}`
                if (!visited.has(neighborKey)) {
                    visited.add(neighborKey)
                    queue.push(neighbor.vertex)
                }
            } else {
                touchingColors.add(neighbor.color)
            }
        }
    }

    return { region, touchingColors }
}
