import {prisma} from './lib/prisma.js'

async function main() {
    // Create a new user with a post
    const version = await prisma.version.create({
        data: {
            versionNumber: "1.0.0",
            description: 'Version 1'
        },
    })
    console.log('Created version:', version)

    // Fetch all users with their posts
    const allVersions = await prisma.version.findMany({
    })
    console.log('All versions:', JSON.stringify(allVersions, null, 2))
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        // @ts-ignore
        process.exit(1)
    })