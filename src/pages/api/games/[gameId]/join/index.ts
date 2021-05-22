import { Game, PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../../../lib/types'

type JoinGameResponseData = Game | never

const prisma = new PrismaClient()

export default async (
    req: NextApiRequest,
    res: NextApiResponse<JoinGameResponseData>
) => {
    const {
        query: { gameId },
        method,
    } = req

    switch (method) {
        case HttpMethod.POST:
            const gId = Number(gameId)
            if (isNaN(gId)) {
                res.status(400).end(`invalid gameId ${gameId}`)
                break
            }

            const existingGame = await prisma.game.findUnique({
                where: { id: gId },
            })

            if (!existingGame) {
                res.status(404).end(`game with id ${gId} does not exist`)
                break
            }

            await prisma.userGames.create({
                data: {
                    playerColor: 'WHITE',
                    gameId: existingGame.id,
                    userId: existingGame.id,
                },
            })

            res.status(200).json(existingGame)
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
