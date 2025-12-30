import { Game } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import webPush from 'web-push'
import prisma from '../../../lib/db'
import { start } from '../../../lib/game'
import { HttpMethod, PlayerColor } from '../../../lib/types'
import {
    withTelemetry,
    logger,
    gamesCreatedCounter,
    pushNotificationsSentCounter,
    pushNotificationsFailedCounter,
} from '../../../lib/telemetry'

webPush.setVapidDetails(
    `mailto:${process.env.WEB_PUSH_EMAIL}`,
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? '',
    process.env.WEB_PUSH_PRIVATE_KEY ?? ''
)

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
            logger.debug('Listed games', { count: games.length })
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

                gamesCreatedCounter.add(1)
                logger.info('Game created', {
                    gameId: newGame.id,
                    title,
                    authorId: author.id,
                })

                res.status(200).json(newGame)

                // Broadcast to all global subscribers (fire and forget)
                const globalSubscriptions = await prisma.subscription.findMany({
                    where: { isGlobal: true },
                })

                globalSubscriptions.forEach((sub: any) => {
                    // Don't notify the creator about their own game
                    if (sub.userId === author.id) return

                    const subscription = JSON.parse(sub.subscription)
                    webPush
                        .sendNotification(
                            subscription,
                            JSON.stringify({
                                type: 'NEW_GAME_CREATED',
                                title: 'Neues Spiel verfügbar!',
                                message: `Ein neues Spiel "${title}" wurde erstellt`,
                                data: { game: newGame },
                            })
                        )
                        .then(() => {
                            pushNotificationsSentCounter.add(1, {
                                type: 'new_game',
                            })
                        })
                        .catch((err: any) => {
                            pushNotificationsFailedCounter.add(1, {
                                type: 'new_game',
                            })
                            logger.error(
                                'Failed to send new game notification',
                                err,
                                { gameId: newGame.id, type: 'new_game' }
                            )
                        })
                })
            } catch (err) {
                logger.error('Failed to create game', err, { userId, title })
            }

            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default withTelemetry(apiMethod, { operationName: 'games' })
