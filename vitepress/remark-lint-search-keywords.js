export default function remarkLintSearchKeywords() {
    return (tree, file) => {
        const content = String(file)

        const hasKeywords =
            /search:\s*[\s\S]*?keywords:/m.test(content)

        if (!hasKeywords) {
            file.message(
                'Fehlende Such-Keywords (frontmatter: search.keywords)',
                tree
            )
        }

        const umlauts = [
            ['ä', 'ae'],
            ['ö', 'oe'],
            ['ü', 'ue'],
            ['ß', 'ss']
        ]

        for (const [umlaut, ascii] of umlauts) {
            if (
                content.includes(umlaut) &&
                !content.includes(ascii)
            ) {
                file.message(
                    `Umlaut "${umlaut}" gefunden, aber keine ASCII-Variante "${ascii}"`,
                    tree
                )
            }
        }
    }
}
