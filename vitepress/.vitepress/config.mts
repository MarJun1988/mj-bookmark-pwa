import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Lesezeichen Verwaltung",
    description: "kommt noch ..",
    base: '/help/',
    lang: 'de-DE',
    srcDir: './src',
    outDir: './dist',
    assetsDir: 'static',
    cleanUrls: true,
    lastUpdated: true,
    // head: [['link', {rel: 'icon', href: '/help/favicon.ico'}]],
    themeConfig: {
        // logo: '/logo.png',
        search: {
            provider: 'local',
            options: {
                translations: {
                    button: {
                        buttonText: 'Suche',
                        buttonAriaLabel: 'Suche'
                    },
                    modal: {
                        displayDetails: 'Details anzeigen',
                        resetButtonTitle: 'Zurücksetzen',
                        backButtonTitle: 'Zurück',
                        noResultsText: 'Keine Ergebnisse gefunden',
                        footer: {
                            selectText: 'Auswählen',
                            navigateText: 'Navigieren',
                            closeText: 'Schließen'
                        }
                    }
                }
            }
        },
        footer: {
            message: 'Erstellt von M. Junghans',
            copyright: 'Copyright © 2025'
        },
        lastUpdated: {
            text: 'Zuletzt aktualisiert',
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'medium'
            }
        },
        docFooter: {
            prev: 'Vorherige Seite',
            next: 'Nächste Seite'
        },
        outlineTitle: 'Auf dieser Seite',
        // https://vitepress.dev/reference/default-theme-config
        // nav: [
        //     {text: 'Vorwort', link: '/'},
        //     {text: 'Grundlagen', link: '/grundlagen/anforderung'},
        //     {text: 'Dashboard', link: '/dashboard/'},
        //     {text: 'Verwaltung', link: '/management-area/'},
        //     {text: 'Zur Anwendung', link: '/zur-anwendung'},
        // ],
        // sidebar: {
        //     '/grundlagen/': grundlagenSidebar,
        //     '/dashboard/': dashboardSidebar,
        //     '/management-area/': managementSidebar,
        // }
    }
})
