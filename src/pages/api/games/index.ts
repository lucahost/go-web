import { Game, Prisma, PrismaClient } from '.prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../lib/types'

type GameResponseData = Game[] | Game | never

type CreateGameDto = {
    userId: number
}

type NextApiRequestWithCreateGameDto = NextApiRequest & CreateGameDto

const prisma = new PrismaClient()

const apiMethod = async (
    req: NextApiRequestWithCreateGameDto,
    res: NextApiResponse<GameResponseData>
) => {
    const { method, body } = req

    switch (method) {
        case HttpMethod.GET:
            const games = await prisma.game.findMany()
            res.status(200).json(games)
            break
        case HttpMethod.POST:
            // TODO: create new game and return game state
            const createGameDto: CreateGameDto = body
            const gameData = {
                authorId: createGameDto.userId,
            }
            const newGame = await prisma.game.create({ data: gameData })
            res.status(200).json(newGame)
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default apiMethod
