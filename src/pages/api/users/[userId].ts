import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@prisma/client'
import { HttpMethod } from '../../../lib/types'

type UserResponseData = User

import prisma from '../../../lib/db'

const apiMethod = async (
    req: NextApiRequest,
    res: NextApiResponse<UserResponseData>
) => {
    const { method } = req
    const { userId } = req.query

    switch (method) {
        case HttpMethod.GET:
            const uId = Number(userId)
            if (isNaN(uId)) {
                res.status(400).end(`${userId} is not a valid userId`)
                return
            }
            const existingUser = await prisma.user.findUnique({
                where: {
                    id: uId,
                },
            })
            if (existingUser) {
                res.status(200).json(existingUser)
            } else {
                res.status(404).end()
            }
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default apiMethod
