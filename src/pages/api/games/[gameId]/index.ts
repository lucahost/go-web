import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod, Game, GoBoard, Player } from '../../../../lib/types'
import prisma from '../../../../lib/db'
import {
    withTelemetry,
    logger,
    gamesDeletedCounter,
} from '../../../../lib/telemetry'

type GameResponse = Game | { deleted: boolean } | never

const GameApi = async (
    req: NextApiRequest,
    res: NextApiResponse<GameResponse>
) => {
    const {
        query: { gameId },
        method,
    } = req

    const gId = Number(gameId)
    if (isNaN(gId)) {
        res.status(400).end(`${gId} is not a valid gameId`)
        return
    }

    switch (method) {
        case HttpMethod.GET:
            const existingGame = await prisma.game.findUnique({
                where: {
                    id: gId,
                },
                include: {
                    players: true,
                    currentPlayer: true,
                    author: true,
                },
            })

            if (existingGame) {
                const mappedPlayers = existingGame.players.map(
                    (player: Player) => {
                        return {
                            ...player,
                            playerColor: player.playerColor,
                        }
                    }
                )

                const resObject = {
                    ...existingGame,
                    players: mappedPlayers,
                    currentPlayer: {
                        ...existingGame.currentPlayer,
                        playerColor: existingGame.currentPlayerColor,
                    },
                } as Game

                if (resObject.board) {
                    resObject.board = JSON.parse(existingGame.board) as GoBoard
                }
                res.status(200).json(resObject)
            } else {
                res.status(404).end()
            }
            break

        case HttpMethod.DELETE:
            const gameToDelete = await prisma.game.findUnique({
                where: { id: gId },
            })

            if (!gameToDelete) {
                logger.warn('Game not found for deletion', { gameId: gId })
                res.status(404).end(`Game ${gId} not found`)
                return
            }

            await prisma.$transaction([
                prisma.subscription.deleteMany({ where: { gameId: gId } }),
                prisma.userGame.deleteMany({ where: { gameId: gId } }),
                prisma.game.delete({ where: { id: gId } }),
            ])

            logger.info('Game deleted', { gameId: gId })
            gamesDeletedCounter.add(1)

            res.status(200).json({ deleted: true })
            break

        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.DELETE])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default withTelemetry(GameApi, { operationName: 'games.byId' })
