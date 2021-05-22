import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../../../lib/types'

type Data = {
    name: string
}

const prisma = new PrismaClient()

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
        query: { gameId },
        method,
    } = req

    switch (method) {
        case HttpMethod.POST:
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

            res.status(200).json({ name: `TODO: Join game ${gameId}` })
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
