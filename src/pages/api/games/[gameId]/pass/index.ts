import { NextApiRequest, NextApiResponse } from 'next'
import { GoBoard, HttpMethod } from '../../../../../lib/types'
import webPush from 'web-push'
import prisma from '../../../../../lib/db'
import { pass } from '../../../../../lib/game'

const { error } = console

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { gameId },
        method,
    } = req
    const { userId } = req.body

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

                if (game === undefined || game === null) {
                    throw `game with id ${gId} not found`
                }

                let goBoard = JSON.parse(game.board) as GoBoard

                goBoard = pass(goBoard)

                game.board = JSON.stringify(goBoard)
                if (game.currentPlayer) {
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
                    }
                }

                const existingSubscriptions =
                    await prisma.subscription.findMany({
                        where: { gameId: gId },
                    })

                if (existingSubscriptions) {
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
                            .catch(err => {
                                error(
                                    `could not send push notifications. error ${err}`
                                )
                            })
                    })
                }
            }
            res.status(200)
            break
        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
