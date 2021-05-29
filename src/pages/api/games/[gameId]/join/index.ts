import { Game } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
    GameState,
    GoBoard,
    HttpMethod,
    PlayerColor,
} from '../../../../../lib/types'
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
                    playerColor: 'BLACK',
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

            const currentPlayer = await prisma.user.findUnique({
                where: { id: userId },
            })

            if (existingGame.authorId) {
                const author = await prisma.user.findUnique({
                    where: { id: existingGame.authorId },
                })

                const board = JSON.parse(existingGame.board) as GoBoard
                if (author && board && currentPlayer) {
                    board.currentPlayer = {
                        color: PlayerColor.BLACK,
                        identifier: userId,
                        name: currentPlayer.name ?? '',
                    }
                    board.status = GameState.RUNNING
                    board.players = [
                        {
                            identifier: String(author.id),
                            color: PlayerColor.WHITE,
                            name: author.name ?? '',
                        },
                        {
                            identifier: userId,
                            color: PlayerColor.BLACK,
                            name: '',
                        },
                    ]
                    existingGame.gameState = GameState.RUNNING
                    existingGame.board = JSON.stringify(board)

                    await prisma.game.update({
                        where: { id: existingGame.id },
                        data: { ...existingGame },
                    })
                }
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
