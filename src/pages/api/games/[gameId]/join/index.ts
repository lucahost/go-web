import type { NextApiRequest, NextApiResponse } from 'next'
import { GameState, HttpMethod, PlayerColor } from '../../../../../lib/types'
import webPush from 'web-push'
import prisma from '../../../../../lib/db'
import { Game } from '@prisma/client'
import {
    withTelemetry,
    logger,
    gameJoinsCounter,
    pushNotificationsSentCounter,
    pushNotificationsFailedCounter,
} from '../../../../../lib/telemetry'

type JoinGameResponseData = Game | never

webPush.setVapidDetails(
    `mailto:${process.env.WEB_PUSH_EMAIL}`,
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? '',
    process.env.WEB_PUSH_PRIVATE_KEY ?? ''
)

const JoinApi = async (
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

            // test if user is already in game, return game
            const existingUserGame = await prisma.userGame.findFirst({
                where: { userId: uId, gameId: gId },
            })
            if (existingUserGame) {
                res.status(200).json(existingGame)
                return
            }

            await prisma.userGame.create({
                data: {
                    playerColor: PlayerColor.BLACK,
                    userId: uId,
                    gameId: existingGame.id,
                },
            })

            // Update board's currentPlayer to the joining BLACK player
            const board = JSON.parse(existingGame.board)
            board.currentPlayer = {
                userId: uId,
                gameId: gId,
                playerColor: PlayerColor.BLACK,
            }

            const updatedGame = await prisma.game.update({
                where: { id: existingGame.id },
                data: {
                    board: JSON.stringify(board),
                    gameState: GameState.RUNNING,
                    currentPlayerColor: PlayerColor.BLACK,
                    currentPlayerId: uId,
                },
            })

            gameJoinsCounter.add(1, { gameId: String(gId) })
            logger.info('Player joined game', { gameId: gId, userId: uId })

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

            // Send push notifications to game subscribers (fire and forget)
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
                    .then(() => {
                        pushNotificationsSentCounter.add(1, {
                            type: 'join',
                        })
                    })
                    .catch((err: any) => {
                        pushNotificationsFailedCounter.add(1, {
                            type: 'join',
                        })
                        logger.error('Failed to send push notification', err, {
                            gameId: gId,
                            type: 'join',
                        })
                    })
            })

            // Broadcast GAME_STARTED to all global subscribers (fire and forget)
            const globalSubscriptions = await prisma.subscription.findMany({
                where: { isGlobal: true },
            })

            globalSubscriptions.forEach((sub: any) => {
                const subscription = JSON.parse(sub.subscription)
                webPush
                    .sendNotification(
                        subscription,
                        JSON.stringify({
                            type: 'GAME_STARTED',
                            title: 'Spiel gestartet!',
                            message: `Das Spiel "${existingGame.title}" hat begonnen`,
                            data: { gameId: gId },
                        })
                    )
                    .then(() => {
                        pushNotificationsSentCounter.add(1, {
                            type: 'game_started',
                        })
                    })
                    .catch((err: any) => {
                        pushNotificationsFailedCounter.add(1, {
                            type: 'game_started',
                        })
                        logger.error(
                            'Failed to send game started notification',
                            err,
                            { gameId: gId, type: 'game_started' }
                        )
                    })
            })

            res.status(200).json(updatedGame)
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default withTelemetry(JoinApi, { operationName: 'games.join' })
