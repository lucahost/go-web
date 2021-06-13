import type { NextApiRequest, NextApiResponse } from 'next'
import { withNewFieldColor } from '../../../../../lib/board'
import prisma from '../../../../../lib/db'
import webPush from 'web-push'
import { GoBoard, HttpMethod, PlayerColor } from '../../../../../lib/types'

const { log, error } = console

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { gameId },
        method,
    } = req
    const { vertex, userId } = req.body

    switch (method) {
        case HttpMethod.POST:
            const gId = Number(gameId)
            if (gId) {
                const game = await prisma.game.findUnique({
                    where: { id: gId },
                    include: {
                        currentPlayer: true,
                        players: true,
                    },
                })
                if (game) {
                    const goBoard = JSON.parse(game.board) as GoBoard
                    // TODO: Process move and return move
                    // const newGoBoard = move(goBoard, vertex)
                    if (game.currentPlayer) {
                        goBoard.fields = withNewFieldColor(
                            goBoard.fields,
                            vertex,
                            game.currentPlayer?.playerColor == 'WHITE'
                                ? PlayerColor.WHITE
                                : PlayerColor.BLACK
                        )

                        if (game.players) {
                            const nextPlayer = game.players.find(
                                p => p.userId !== userId
                            )

                            if (!nextPlayer) {
                                throw 'next player not found'
                            }

                            await prisma.game.update({
                                where: { id: game.id },
                                data: {
                                    board: JSON.stringify(goBoard),
                                    currentPlayerColor: nextPlayer.playerColor,
                                    currentPlayerId: nextPlayer.userId,
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
                        }
                    }
                }
            }
            res.status(200)
            break
        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
