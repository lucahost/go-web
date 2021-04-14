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
            // TODO: Process move and return move
            res.status(200).json({ name: `POST /games/${gameId}/move` })
            break
        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
