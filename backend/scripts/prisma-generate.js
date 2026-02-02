if (process.env.SKIP_PRISMA_GENERATE === 'true') {
    console.log('⏭️  Skipping prisma generate')
    process.exit(0)
}

if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL missing, skipping prisma generate')
    process.exit(0)
}

import('child_process').then(({execSync}) => {
    execSync('npx prisma generate', {stdio: 'inherit'})
})
