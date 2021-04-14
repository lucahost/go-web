import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../../lib/types'

type Data = {
    name: string
}

export default (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
        query: { gameId },
        method,
    } = req

    switch (method) {
        case HttpMethod.GET:
            // TODO: Return game by id
            res.status(200).json({ name: `TODO: Show game ${gameId}` })
            break
        case HttpMethod.DELETE:
            // TODO: Stop game by id
            res.status(200).json({ name: `TODO: Stop game ${gameId}` })
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
