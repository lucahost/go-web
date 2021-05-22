import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../../../lib/types'

type Data = {
    name: string
}

export default (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
        query: { gameId },
        method,
    } = req

    switch (method) {
        case HttpMethod.POST:
            // TODO: Join a game by game id (request param) and user id (body)
            res.status(200).json({ name: `TODO: Join game ${gameId}` })
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
