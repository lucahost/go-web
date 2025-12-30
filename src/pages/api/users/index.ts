import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@prisma/client'
import { HttpMethod } from '../../../lib/types'
import {
    withTelemetry,
    logger,
    usersCreatedCounter,
} from '../../../lib/telemetry'

type UserResponseData = User | User[]

import prisma from '../../../lib/db'

const apiMethod = async (
    req: NextApiRequest,
    res: NextApiResponse<UserResponseData>
) => {
    const { method, body } = req

    switch (method) {
        case HttpMethod.GET:
            const users = await prisma.user.findMany()
            logger.debug('Listed users', { count: users.length })
            res.status(200).json(users)
            break
        case HttpMethod.POST:
            if (body?.name === '' || body?.name === null) {
                res.status(400).end(`no name in request`)
                return
            }

            const existingUser = await prisma.user.findUnique({
                where: {
                    name: body.name,
                },
            })
            if (existingUser) {
                logger.debug('User already exists', { userId: existingUser.id })
                res.status(200).json(existingUser)
                return
            }

            const user = await prisma.user.create({ data: body })
            usersCreatedCounter.add(1)
            logger.info('User created', { userId: user.id, name: user.name })
            res.status(201).json(user)
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default withTelemetry(apiMethod, { operationName: 'users' })
