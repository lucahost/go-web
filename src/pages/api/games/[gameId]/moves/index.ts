import type { NextApiRequest, NextApiResponse } from 'next'
import { withNewFieldColor } from '../../../../../lib/board'
import prisma from '../../../../../lib/db'
import webPush from 'web-push'
import { GoBoard, HttpMethod, PlayerColor } from '../../../../../lib/types'

type Data = {
    name: string
}

const { log, error } = console

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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
                })
                if (game) {
                    const goBoard = JSON.parse(game.board) as GoBoard
                    // TODO: Process move and return move
                    // const newGoBoard = move(goBoard, vertex)
                    if (goBoard.currentPlayer) {
                        goBoard.fields = withNewFieldColor(
                            goBoard.fields,
                            vertex,
                            goBoard.currentPlayer?.color
                        )

                        const gamePlayers = await prisma.userGames.findMany({
                            where: {
                                gameId: gId,
                            },
                        })

                        if (gamePlayers) {
                            const nextPlayer = gamePlayers.find(
                                p => p.userId !== userId
                            )

                            if (!nextPlayer) {
                                throw 'next player not found'
                            }
                            const nextPlayerUser = await prisma.user.findUnique(
                                {
                                    where: {
                                        id: nextPlayer.userId,
                                    },
                                }
                            )
                            if (!nextPlayerUser || !nextPlayerUser.name) {
                                throw 'next player user not found'
                            }

                            goBoard.currentPlayer = {
                                color:
                                    nextPlayer?.playerColor == 'WHITE'
                                        ? PlayerColor.WHITE
                                        : PlayerColor.BLACK,
                                identifier: String(nextPlayer?.userId) ?? '',
                                name: nextPlayerUser.name,
                            }
                            game.board = JSON.stringify(goBoard)

                            await prisma.game.update({
                                where: { id: game.id },
                                data: { ...game },
                            })

                            const existingSubscriptions = await prisma.subscription.findMany(
                                {
                                    where: { gameId: gId },
                                }
                            )

                            if (existingSubscriptions) {
                                existingSubscriptions.forEach(sub => {
                                    const subscription = JSON.parse(
                                        sub.subscription
                                    )
                                    webPush
                                        .sendNotification(
                                            subscription,
                                            JSON.stringify({
                                                title:
                                                    'A move in your game was made!',
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
            res.status(200).json({ name: `POST /games/${gameId}/move` })
            break
        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
