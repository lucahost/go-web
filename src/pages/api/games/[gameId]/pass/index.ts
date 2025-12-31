import { NextApiRequest, NextApiResponse } from 'next'
import { GoBoard, HttpMethod } from '../../../../../lib/types'
import webPush from 'web-push'
import prisma from '../../../../../lib/db'
import { pass } from '../../../../../lib/game'
import {
    withTelemetry,
    logger,
    passesMadeCounter,
    pushNotificationsSentCounter,
    pushNotificationsFailedCounter,
} from '../../../../../lib/telemetry'

const PassApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { gameId },
        method,
    } = req
    const { userId } = req.body

    switch (method) {
        case HttpMethod.POST:
            const gId = Number(gameId)
            if (!gId) {
                res.status(400).json({
                    error: 'Invalid gameId',
                    message: `gameId must be a number, got: ${gameId}`,
                })
                return
            }

            const game = await prisma.game.findUnique({
                where: { id: gId },
                include: {
                    currentPlayer: true,
                    players: true,
                    author: true,
                },
            })

            if (!game) {
                res.status(404).json({
                    error: 'Game not found',
                    message: `Game with id ${gId} not found`,
                    gameId: gId,
                })
                return
            }

            let goBoard = JSON.parse(game.board) as GoBoard

            try {
                goBoard = pass(game, goBoard, userId)
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                logger.error('Pass failed', {
                    gameId: gId,
                    userId,
                    error: message,
                })
                res.status(400).json({
                    error: 'Pass failed',
                    message,
                    gameId: gId,
                })
                return
            }

            // Update the game with the new board state
            // The pass() function handles switching the currentPlayer on the board
            await prisma.game.update({
                where: { id: game.id },
                data: {
                    gameState: game.gameState,
                    board: JSON.stringify(goBoard),
                    currentPlayerColor:
                        goBoard.currentPlayer?.playerColor ?? null,
                    currentPlayerId: goBoard.currentPlayer?.userId ?? null,
                },
            })

            passesMadeCounter.add(1, { gameId: String(gId) })

            const existingSubscriptions = await prisma.subscription.findMany({
                where: { gameId: gId },
            })

            existingSubscriptions.forEach(sub => {
                const subscription = JSON.parse(sub.subscription)
                webPush
                    .sendNotification(
                        subscription,
                        JSON.stringify({
                            title: 'A pass in your game was made!',
                            message: `${userId} just passed!`,
                        })
                    )
                    .then(() => {
                        pushNotificationsSentCounter.add(1, {
                            type: 'pass',
                        })
                    })
                    .catch(err => {
                        pushNotificationsFailedCounter.add(1, {
                            type: 'pass',
                        })
                        logger.error('Failed to send push notification', err, {
                            gameId: gId,
                            type: 'pass',
                        })
                    })
            })

            res.status(200).json(goBoard)
            return
        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default withTelemetry(PassApi, { operationName: 'games.pass' })
