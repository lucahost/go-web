import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, User } from '@prisma/client'
import { HttpMethod } from '../../../lib/types'

type UserResponseData = User | User[]

type CreateUserDto = {
    name?: string
    email: string
}

type NextApiRequestWithCreateUserDto = NextApiRequest & CreateUserDto

const prisma = new PrismaClient()

const apiMethod = async (
    req: NextApiRequestWithCreateUserDto,
    res: NextApiResponse<UserResponseData>
) => {
    const { method, body } = req

    switch (method) {
        case HttpMethod.GET:
            const users = await prisma.user.findMany()
            res.status(200).json(users)
            break
        case HttpMethod.POST:
            if (body?.email === '' || body?.email === null) {
                res.status(400).end(`no email in request`)
                return
            }

            const existingUser = await prisma.user.findUnique({
                where: {
                    email: body.email,
                },
            })
            if (existingUser) {
                res.status(400).end(
                    `user with email ${body.email} already exists`
                )
                return
            }

            const user = await prisma.user.create({ data: body })
            res.status(201).json(user)
            break
        default:
            res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default apiMethod
