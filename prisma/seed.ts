import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
    {
        name: 'Alice',
        email: 'alice@go.io',
    },
    {
        name: 'Bob',
        email: 'bob@go.io',
    },
]

const gameData: Prisma.GameCreateInput[] = [
    {
        title: 'Test Game 1',
        author: {
            connect: {
                email: 'alice@go.io',
            },
        },
    },
    {
        title: 'Test Game 2',
        author: {
            connect: {
                email: 'bob@go.io',
            },
        },
    },
]

const userGameMapping: Prisma.UserGameCreateInput[] = [
    {
        game: {
            connect: {
                id: 1,
            },
        },
        playerColor: 1,
        user: {
            connect: {
                email: 'alice@go.io',
            },
        },
    },
    {
        game: {
            connect: {
                id: 1,
            },
        },
        playerColor: -1,
        user: {
            connect: {
                email: 'bob@go.io',
            },
        },
    },
    {
        game: {
            connect: {
                id: 2,
            },
        },
        playerColor: -1,
        user: {
            connect: {
                email: 'alice@go.io',
            },
        },
    },
    {
        game: {
            connect: {
                id: 2,
            },
        },
        playerColor: 1,
        user: {
            connect: {
                email: 'bob@go.io',
            },
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

    for (const g of gameData) {
        const game = await prisma.game.create({
            data: g,
        })
        console.log(`Created game with id: ${game.id}`)
    }

    for (const ugMapping of userGameMapping) {
        const ug = await prisma.userGame.create({
            data: ugMapping,
        })
        console.log(
            `Created user game mapping with gameId: ${ug.gameId}, userId: ${ug.userId}, playerColor: ${ug.playerColor}`
        )
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
