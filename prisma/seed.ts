﻿import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
    {
        name: 'Alice',
        email: 'alice@go.io',
        authoredGames: {
            create: {},
        },
    },
    {
        name: 'Bob',
        email: 'bob@go.io',
        authoredGames: {
            create: {},
        },
    },
]
async function main() {
    console.log(`Start seeding ...`)
    for (const u of userData) {
        const user = await prisma.user.create({
            data: u,
        })
        console.log(`Created user with id: ${user.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
