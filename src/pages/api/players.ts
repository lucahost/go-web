import type { NextApiRequest, NextApiResponse } from 'next'
type Data = {
    name: string
}

export default (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // create new player
        const requestData = <Data>req.body
        if (!requestData.name) {
            const error = new ApiError('Bad Request')
            res.status(400)
            res.send(error)
        }
        if (requestData.name) {
        }
        res.status(200).json({ name: 'Go' })
    } else {
        res.status(405)
    }
}
