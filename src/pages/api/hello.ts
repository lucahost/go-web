import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    name: string
}

export default (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method === 'GET') {
        res.status(200).json({ name: 'Go' })
    } else {
        res.status(405)
    }
}
