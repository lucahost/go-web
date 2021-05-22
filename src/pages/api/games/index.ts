import { Game, PrismaClient } from '.prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../lib/types'

type GameResponseData = Game[] | never

type CreateGameDto = {
    userId: string
}

type NextApiRequestWithCreateGameDto = NextApiRequest & CreateGameDto

const prisma = new PrismaClient()

const apiMethod = (
    req: NextApiRequest,
    res: NextApiResponse<GameResponseData>
) => {
    const { method } = req

    switch (method) {
        case HttpMethod.GET:
            prisma.game.findMany({
                where: {
                    gameState: 0,
                },
            })
            res.status(200).json()
            break
        case HttpMethod.POST:
            // TODO: Start new game and return game state
            res.status(200).json({ name: 'Post /games' })
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default apiMethod
