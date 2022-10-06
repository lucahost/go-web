import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../lib/db'
import webPush from 'web-push'
import { GoBoard, HttpMethod } from '../../../../../lib/types'
import { move } from '../../../../../lib/game'

const { error } = console

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

                        const existingSubscriptions =
                            await prisma.subscription.findMany({
                                where: { gameId: gId },
                            })

                        if (existingSubscriptions) {
                            existingSubscriptions.forEach(sub => {
                                const subscription = JSON.parse(
                                    sub.subscription
                                )
                                webPush
                                    .sendNotification(
                                        subscription,
                                        JSON.stringify({
                                            title: 'A move in your game was made!',
                                            message: `${userId} just set a stone!`,
                                        })
                                    )
                                    .catch(err => {
                                        error(
                                            `could not send push notifications. error ${err}`
                                        )
                                    })
                            })
                        } else {
                            res.status(404).end(
                                `Subscription for game ${gId} and currentPlayer not found`
                            )
                        }
                    } else {
                        res.status(404).end(
                            `Game ${gId} currentPlayer is not currentPlayer ${goBoard.currentPlayer?.userId}`
                        )
                    }
                } else {
                    res.status(404).end(
                        `Game ${gId} with currentPlayer not found`
                    )
                }
            }
            res.status(200)
            break
        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default MoveApi
