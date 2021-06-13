import { Game } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db'
import { start } from '../../../lib/game'
import { HttpMethod, PlayerColor } from '../../../lib/types'

type GameResponseData = Game[] | Game | never

type CreateGameDto = {
    userId: number
    title: string
    subscription?: string
}

const apiMethod = async (
    req: NextApiRequest,
    res: NextApiResponse<GameResponseData>
) => {
    const { method } = req
    const { userId, title, subscription } = req.body as CreateGameDto

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
                title: title,
                board: JSON.stringify(start()),
            }
            try {
                const newGame = await prisma.game.create({
                    data: {
                        ...gameData,
                        author: { connect: { id: author.id } },
                        players: {
                            create: [
                                {
                                    userId: author.id,
                                    playerColor: PlayerColor.WHITE,
                                },
                            ],
                        },
                    },
                    include: {
                        author: true,
                        players: true,
                    },
                })

                if (subscription) {
                    await prisma.subscription.create({
                        data: {
                            subscription: subscription,
                            userId: author.id,
                            gameId: newGame.id,
                        },
                    })
                }

                res.status(200).json(newGame)
            } catch (err) {
                console.error(err)
            }

            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default apiMethod
