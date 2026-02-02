import { prisma } from '../../dist/lib/prisma.js'
import { Tag, Version } from '../../dist/generated/prisma/client.js'

const SAMPLE_TABS: string[] = [
  'Work',
  'Personal',
  'Learning',
  'Shopping',
  'Entertainment',
]

const SAMPLE_GROUPS: string[] = [
  'Development Tools',
  'Design Resources',
  'News & Blogs',
  'Social Media',
  'Documentation',
  'Tutorials',
  'Videos',
  'E-Commerce',
  'Finance',
  'Health & Fitness',
  'Travel',
  'Recipes',
  'Music',
  'Gaming',
  'Productivity',
]

const SAMPLE_LINKS: { title: string; url: string }[] = [
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  { title: 'VS Code', url: 'https://code.visualstudio.com' },
  { title: 'Figma', url: 'https://figma.com' },
  { title: 'Dribbble', url: 'https://dribbble.com' },
  { title: 'Dev.to', url: 'https://dev.to' },
  { title: 'Medium', url: 'https://medium.com' },
  { title: 'YouTube', url: 'https://youtube.com' },
  { title: 'Twitter', url: 'https://twitter.com' },
  { title: 'LinkedIn', url: 'https://linkedin.com' },
  { title: 'Reddit', url: 'https://reddit.com' },
  { title: 'Amazon', url: 'https://amazon.com' },
  { title: 'eBay', url: 'https://ebay.com' },
  { title: 'Netflix', url: 'https://netflix.com' },
  { title: 'Spotify', url: 'https://spotify.com' },
  { title: 'Notion', url: 'https://notion.so' },
  { title: 'Trello', url: 'https://trello.com' },
  { title: 'Slack', url: 'https://slack.com' },
  { title: 'Discord', url: 'https://discord.com' },
]

const SAMPLE_TAGS: string[] = [
  'javascript',
  'typescript',
  'react',
  'nodejs',
  'python',
  'design',
  'ui-ux',
  'css',
  'html',
  'api',
  'tutorial',
  'documentation',
  'news',
  'tools',
  'productivity',
  'entertainment',
  'shopping',
  'social',
  'video',
  'music',
]

const SAMPLE_VERSION = [
  {
    versionNumber: 'v.1.0.0',
    description: 'Beschreibung - v.1.0.0',
  },
  {
    versionNumber: 'v.1.0.1',
    description: 'Beschreibung - v.1.0.1',
  },
  {
    versionNumber: 'v.2.0.0',
    description: 'Beschreibung - v.2.0.0',
  },
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomTags(arr: Tag[], count: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function randomItems(
  arr: {
    title: string
    url: string
  }[],
  count: number,
) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function randomGroup(arr: string[], count: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

async function main() {
  console.log('🌱 Starting seed...')

  // Alte Daten löschen
  // await prisma.itemTag.deleteMany()
  // await prisma.item.deleteMany()
  // await prisma.tag.deleteMany()
  // await prisma.group.deleteMany()
  // await prisma.tab.deleteMany()
  // await prisma.refreshToken.deleteMany()
  // await prisma.user.deleteMany()
  // await prisma.version.deleteMany()

  // console.log('🗑️  Cleaned database')

  // User erstellen
  // const hashedPassword = await bcrypt.hash('password123', 10)
  //
  // const user: User = await prisma.user.create({
  //   data: {
  //     email: 'demo@example.com',
  //     password: hashedPassword,
  //     firstName: 'Demo',
  //     lastName: 'User',
  //     displayName: 'DU',
  //     role: 'ADMIN',
  //     emailVerified: true,
  //   },
  // })
  //
  // console.log(`✅ Created user: ${user.email}`)

  // Tags erstellen
  // const tags: Tag[] = await Promise.all(
  //   SAMPLE_TAGS.map((name) =>
  //     prisma.tag.create({
  //       data: { name, slug: name },
  //     }),
  //   ),
  // )

  // console.log(`✅ Created ${tags.length} tags`)

  // Tabs mit Gruppen und Items erstellen
  // for (const tabName of SAMPLE_TABS) {
  //   const tab: Tab = await prisma.tab.create({
  //     data: {
  //       title: tabName,
  //       userId: user.id,
  //       order: SAMPLE_TABS.indexOf(tabName),
  //     },
  //   })
  //
  //   console.log(`📑 Created tab: ${tabName}`)
  //
  //   // 3-6 Gruppen pro Tab
  //   const numGroups: number = randomInt(3, 6)
  //   const groupsForTab: string[] = randomGroup(SAMPLE_GROUPS, numGroups)
  //
  //   for (let i: number = 0; i < groupsForTab.length; i++) {
  //     const group: Group = await prisma.group.create({
  //       data: {
  //         title: groupsForTab[i],
  //         tabId: tab.id,
  //         order: i,
  //       },
  //     })
  //
  //     console.log(`  📁 Created group: ${groupsForTab[i]}`)
  //
  //     // 3-10 Links pro Gruppe
  //     const numLinks: number = randomInt(3, 10)
  //     const linksForGroup: { title: string; url: string }[] = randomItems(
  //       SAMPLE_LINKS,
  //       numLinks,
  //     )
  //
  //     for (let j = 0; j < linksForGroup.length; j++) {
  //       const link = linksForGroup[j]
  //
  //       const item: Item = await prisma.item.create({
  //         data: {
  //           title: link.title,
  //           url: link.url,
  //           groupId: group.id,
  //           order: j,
  //         },
  //       })
  //
  //       // 1-5 Tags pro Item
  //       const numTags: number = randomInt(1, 5)
  //       const tagsForItem: Tag[] = randomTags(tags, numTags)
  //
  //       await Promise.all(
  //         tagsForItem.map((tag) =>
  //           prisma.itemTag.create({
  //             data: {
  //               itemId: item.id,
  //               tagId: tag.id,
  //             },
  //           }),
  //         ),
  //       )
  //
  //       console.log(
  //         `    🔗 Created item: ${item.title} (${tagsForItem.length} tags)`,
  //       )
  //     }
  //   }
  // }

  // Versionen erstellen
  for (const v of SAMPLE_VERSION) {
    const version: Version = await prisma.version.create({
      data: {
        versionNumber: v.versionNumber,
        description: v.description,
      },
    })

    console.log(`📑 Created version: ${version.versionNumber}`)
  }

  // Statistik
  const stats = {
    users: await prisma.user.count(),
    tabs: await prisma.tab.count(),
    groups: await prisma.group.count(),
    items: await prisma.item.count(),
    tags: await prisma.tag.count(),
    itemTags: await prisma.itemTag.count(),
    versions: await prisma.version.count(),
  }

  console.log('\n📊 Seeding completed!')
  console.log('-------------------')
  // console.log(`Users:     ${stats.users}`)
  // console.log(`Tabs:      ${stats.tabs}`)
  // console.log(`Groups:    ${stats.groups}`)
  // console.log(`Items:     ${stats.items}`)
  // console.log(`Tags:      ${stats.tags}`)
  // console.log(`Item-Tags: ${stats.itemTags}`)
  console.log(`Versions: ${stats.versions}`)
  // console.log('\n🔐 Login credentials:')
  // console.log('Email:    demo@example.com')
  // console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })