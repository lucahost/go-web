import { GoBoard, PlayerColor, Vertex } from './types'
import { getDirectNeighborFields } from './board'

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
            const { region, touchingColors } = analyzeRegion(
                board,
                field.vertex,
                visited
            )

            if (
                touchingColors.has(PlayerColor.BLACK) &&
                !touchingColors.has(PlayerColor.WHITE)
            ) {
                blackScore += region.length
            } else if (
                touchingColors.has(PlayerColor.WHITE) &&
                !touchingColors.has(PlayerColor.BLACK)
            ) {
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
        whitePercentage: Math.round((whiteScore / totalPoints) * 100),
    }
}

const analyzeRegion = (
    board: GoBoard,
    startVertex: Vertex,
    visited: Set<string>
): { region: Vertex[]; touchingColors: Set<PlayerColor> } => {
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

export interface Influence {
    black: number
    white: number
    neutral: number
    blackPercentage: number
    whitePercentage: number
}

export const calculateInfluence = (board: GoBoard): Influence => {
    // 1. Initialize grid with 0
    const influenceGrid: number[][] = Array(board.height)
        .fill(0)
        .map(() => Array(board.width).fill(0))

    // 2. Set initial influence sources (stones)
    // Black = +1, White = -1
    for (const field of board.fields) {
        if (field.color === PlayerColor.BLACK) {
            influenceGrid[field.vertex[0] - 1][field.vertex[1] - 1] = 64
        } else if (field.color === PlayerColor.WHITE) {
            influenceGrid[field.vertex[0] - 1][field.vertex[1] - 1] = -64
        }
    }

    // 3. Diffuse influence
    // Run a few iterations of diffusion to simulate potential territory
    const iterations = 6
    let currentGrid = influenceGrid

    for (let i = 0; i < iterations; i++) {
        const nextGrid: number[][] = currentGrid.map(row => [...row])

        for (let r = 0; r < board.height; r++) {
            for (let c = 0; c < board.width; c++) {
                // If it's a stone, keep its source value (or let it diffuse? usually fixed sources)
                // Let's keep stones fixed as infinite sources for simplicity,
                // OR let them be just initial impulses.
                // Better: Stones are constant sources.
                const field = board.fields.find(
                    f => f.vertex[0] === r + 1 && f.vertex[1] === c + 1
                )
                if (field?.color === PlayerColor.BLACK) {
                    nextGrid[r][c] = 64
                    continue
                }
                if (field?.color === PlayerColor.WHITE) {
                    nextGrid[r][c] = -64
                    continue
                }

                // Calculate average of neighbors
                let sum = 0
                let count = 0

                // Neighbors
                if (r > 0) {
                    sum += currentGrid[r - 1][c]
                    count++
                }
                if (r < board.height - 1) {
                    sum += currentGrid[r + 1][c]
                    count++
                }
                if (c > 0) {
                    sum += currentGrid[r][c - 1]
                    count++
                }
                if (c < board.width - 1) {
                    sum += currentGrid[r][c + 1]
                    count++
                }

                // Simple diffusion: value = avg(neighbors)
                // But we want decay.
                // Value = current + (avg_neighbors - current) * rate?
                // Or just simple: each step, empty point takes sum(neighbors) / 4?
                // Let's use: val = sum(neighbors) / decay.
                // If decay is 4, it's standard diffusion.
                // If decay is 2, it spreads fast.
                // Let's try sum / 4 (standard averaging)
                if (count > 0) {
                    nextGrid[r][c] = sum / 4
                }
            }
        }
        currentGrid = nextGrid
    }

    // 4. Calculate stats
    let blackScore = 0
    let whiteScore = 0
    let neutralScore = 0
    const threshold = 1 // Sensitivity

    for (let r = 0; r < board.height; r++) {
        for (let c = 0; c < board.width; c++) {
            const val = currentGrid[r][c]
            if (val > threshold) {
                blackScore++
            } else if (val < -threshold) {
                whiteScore++
            } else {
                neutralScore++
            }
        }
    }

    const totalPoints = board.width * board.height

    return {
        black: blackScore,
        white: whiteScore,
        neutral: neutralScore,
        blackPercentage: Math.round((blackScore / totalPoints) * 100),
        whitePercentage: Math.round((whiteScore / totalPoints) * 100),
    }
}
