import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db'
import { HttpMethod } from '../../../lib/types'
import { withTelemetry, logger } from '../../../lib/telemetry'
import { Subscription } from '@prisma/client'

type SubscriptionResponseData = Subscription | { message: string } | never

type CreateSubscriptionDto = {
    userId: number
    subscription: string
    isGlobal?: boolean
}

const apiMethod = async (
    req: NextApiRequest,
    res: NextApiResponse<SubscriptionResponseData>
) => {
    const { method } = req

    switch (method) {
        case HttpMethod.POST:
            const { userId, subscription, isGlobal } =
                req.body as CreateSubscriptionDto

            if (!userId || !subscription) {
                res.status(400).end('userId and subscription are required')
                return
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            })

            if (!user) {
                res.status(404).end(`user ${userId} does not exist`)
                return
            }

            // Check if global subscription already exists for this user
            if (isGlobal) {
                const existingGlobal = await prisma.subscription.findFirst({
                    where: {
                        userId,
                        isGlobal: true,
                    },
                })

                if (existingGlobal) {
                    // Update existing subscription
                    const updated = await prisma.subscription.update({
                        where: { id: existingGlobal.id },
                        data: { subscription },
                    })
                    logger.debug('Updated global subscription', { userId })
                    res.status(200).json(updated)
                    return
                }
            }

            const newSubscription = await prisma.subscription.create({
                data: {
                    subscription,
                    userId,
                    isGlobal: isGlobal ?? false,
                },
            })

            logger.info('Created subscription', {
                userId,
                isGlobal: isGlobal ?? false,
            })
            res.status(201).json(newSubscription)
            break

        default:
            res.setHeader('Allow', [HttpMethod.POST])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default withTelemetry(apiMethod, { operationName: 'subscriptions' })
