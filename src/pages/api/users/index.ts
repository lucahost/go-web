import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpMethod } from '../../../lib/types'

type Data = {
    name: string
}

const apiMethod = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { method } = req

    switch (method) {
        case HttpMethod.POST:
            // TODO: Login / Create user (email in body)
            res.status(200).json({ name: 'Post /users' })
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default apiMethod
