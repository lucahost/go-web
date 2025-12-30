import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../lib/db'
import webPush from 'web-push'
import { GoBoard, HttpMethod } from '../../../../../lib/types'
import { move } from '../../../../../lib/game'
import {
    withTelemetry,
    logger,
    movesMadeCounter,
    pushNotificationsSentCounter,
    pushNotificationsFailedCounter,
} from '../../../../../lib/telemetry'

const MoveApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { gameId },
        method,
    } = req
    const { field, userId } = req.body

    switch (method) {
        case HttpMethod.POST:
            const gId = Number(gameId)
            if (gId) {
                const game = await prisma.game.findUnique({
                    where: { id: gId },
                    include: {
                        currentPlayer: true,
                        players: true,
                        author: true,
                    },
                })
                if (game && game.author !== null) {
                    let goBoard = JSON.parse(game.board) as GoBoard
                    goBoard = move(game, field)

                    if (
                        goBoard.currentPlayer &&
                        game.currentPlayer?.userId !==
                            goBoard.currentPlayer?.userId
                    ) {
                        await prisma.game.update({
                            where: { id: game.id },
                            data: {
                                board: JSON.stringify(goBoard),
                                currentPlayerColor:
                                    goBoard.currentPlayer.playerColor,
                                currentPlayerId: goBoard.currentPlayer.userId,
                            },
                        })

                        movesMadeCounter.add(1, {
                            gameId: String(gId),
                            playerColor:
                                goBoard.currentPlayer.playerColor ?? 'unknown',
                        })
                        logger.info('Move made', {
                            gameId: gId,
                            userId,
                            field,
                        })

                        const existingSubscriptions =
                            await prisma.subscription.findMany({
                                where: { gameId: gId },
                            })

                        // Send push notifications (fire and forget)
                        existingSubscriptions.forEach(sub => {
                            const subscription = JSON.parse(sub.subscription)
                            webPush
                                .sendNotification(
                                    subscription,
                                    JSON.stringify({
                                        title: 'A move in your game was made!',
                                        message: `${userId} just set a stone!`,
                                    })
                                )
                                .then(() => {
                                    pushNotificationsSentCounter.add(1, {
                                        type: 'move',
                                    })
                                })
                                .catch(err => {
                                    pushNotificationsFailedCounter.add(1, {
                                        type: 'move',
                                    })
                                    logger.error(
                                        'Failed to send push notification',
                                        err,
                                        { gameId: gId, type: 'move' }
                                    )
                                })
                        })

                        res.status(200).json(goBoard)
                        return
                    } else {
                        res.status(400).end(
                            `Not your turn. Current player: ${game.currentPlayer?.userId}`
                        )
                        return
                    }
                } else {
                    res.status(404).end(`Game ${gId} not found`)
                    return
                }
            } else {
                res.status(400).end(`Invalid gameId: ${gameId}`)
                return
            }
            break
        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default withTelemetry(MoveApi, { operationName: 'games.move' })
