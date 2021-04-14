import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../lib/types'

type Data = {
    name: string
}

const apiMethod = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { method } = req

    switch (method) {
        case HttpMethod.GET:
            // TODO: Return list of games
            res.status(200).json({ name: 'Get /games' })
            break
        case HttpMethod.POST:
            // TODO: Start new game and return game state
            res.status(200).json({ name: 'Post /games' })
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default apiMethod
