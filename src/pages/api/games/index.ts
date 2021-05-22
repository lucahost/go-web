import { Game, PrismaClient } from '.prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../lib/types'

type GameResponseData = Game[] | Game | never

type CreateGameDto = {
    userId: number
    title: string
}

const prisma = new PrismaClient()

const apiMethod = async (
    req: NextApiRequest,
    res: NextApiResponse<GameResponseData>
) => {
    const { method } = req
    const { userId, title } = req.body as CreateGameDto

    switch (method) {
        case HttpMethod.GET:
            const games = await prisma.game.findMany()
            res.status(200).json(games)
            break
        case HttpMethod.POST:
            const author = await prisma.user.findUnique({
                where: { id: userId },
            })

            if (!author) {
                res.status(400).end(`user ${userId} does not exist.`)
                break
            }

            const gameData = {
                authorId: author.id,
                title: title,
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
