import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod, Game, GoBoard } from '../../../../lib/types'

type GameResponse = Game | never

import prisma from '../../../../lib/db'

export default async (
    req: NextApiRequest,
    res: NextApiResponse<GameResponse>
) => {
    const {
        query: { gameId },
        method,
    } = req

    switch (method) {
        case HttpMethod.GET:
            const gId = Number(gameId)
            if (isNaN(gId)) {
                res.status(400).end(`${gId} is not a valid gameId`)
                return
            }
            const existingGame = await prisma.game.findUnique({
                where: {
                    id: gId,
                },
            })

            if (existingGame) {
                const resObject = {
                    ...existingGame,
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
            // TODO: Stop game by id
            res.status(200).end(`TODO: Stop game ${gameId}`)
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
