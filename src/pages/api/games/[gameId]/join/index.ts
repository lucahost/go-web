import { Game } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../../../lib/types'
import webPush from 'web-push'
import prisma from '../../../../../lib/db'

type JoinGameResponseData = Game | never

webPush.setVapidDetails(
    `mailto:${process.env.WEB_PUSH_EMAIL}`,
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? '',
    process.env.WEB_PUSH_PRIVATE_KEY ?? ''
)

const { log, error } = console

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
                    userId: userId,
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
                existingSubscriptions.forEach(sub => {
                    const subscription = JSON.parse(sub.subscription)
                    webPush
                        .sendNotification(
                            subscription,
                            JSON.stringify({
                                title: 'A Player joined your game!',
                                message: `${userId} just joined your game, click this message to start it!`,
                            })
                        )
                        .then(response => {
                            log(
                                `successfully send web push notification. res ${response}`
                            )
                        })
                        .catch(err => {
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
