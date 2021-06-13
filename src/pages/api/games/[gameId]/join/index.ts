import type { NextApiRequest, NextApiResponse } from 'next'
import { GameState, HttpMethod, PlayerColor } from '../../../../../lib/types'
import webPush from 'web-push'
import prisma from '../../../../../lib/db'
import { Game } from '@prisma/client'

type JoinGameResponseData = Game | never

webPush.setVapidDetails(
    `mailto:${process.env.WEB_PUSH_EMAIL}`,
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? '',
    process.env.WEB_PUSH_PRIVATE_KEY ?? ''
)

const { error } = console

export default async (
    req: NextApiRequest,
    res: NextApiResponse<JoinGameResponseData>
) => {
    const {
        query: { gameId },
        method,
        body,
    } = req

    switch (method) {
        case HttpMethod.POST:
            const { userId, subscription } = body
            const gId = Number(gameId)
            const uId = Number(userId)
            if (isNaN(gId)) {
                res.status(400).end(`invalid gameId ${gameId}`)
                break
            }
            if (isNaN(uId)) {
                res.status(400).end(`invalid userId ${userId}`)
                break
            }
            const existingGame = await prisma.game.findUnique({
                where: { id: gId },
            })

            if (!existingGame) {
                res.status(404).end(`game with id ${gId} does not exist`)
                break
            }

            await prisma.userGame.create({
                data: {
                    playerColor: PlayerColor.BLACK,
                    userId: uId,
                    gameId: existingGame.id,
                },
            })

            await prisma.game.update({
                where: { id: existingGame.id },
                data: {
                    ...existingGame,
                    gameState: GameState.RUNNING,
                    currentPlayerColor: PlayerColor.BLACK,
                    currentPlayerId: uId,
                },
            })

            if (subscription) {
                await prisma.subscription.create({
                    data: {
                        subscription,
                        userId,
                        gameId: gId,
                    },
                })
            }

            const existingSubscriptions = await prisma.subscription.findMany({
                where: { gameId: gId },
            })

            if (existingSubscriptions) {
                existingSubscriptions.forEach((sub: any) => {
                    const subscription = JSON.parse(sub.subscription)
                    webPush
                        .sendNotification(
                            subscription,
                            JSON.stringify({
                                title: 'A Player joined your game!',
                                message: `${userId} just joined your game, click this message to start it!`,
                            })
                        )
                        .catch((err: any) => {
                            error(
                                `could not send push notifications. error ${err}`
                            )
                        })
                })
            }

            res.status(200).json(existingGame)
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
