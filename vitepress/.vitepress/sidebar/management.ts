export const managementSidebar = [
    {
        text: 'Verwaltung',
        collapsed: false,
        items: [
            {
                text: 'Grundeinstellung',
                link: '/management-area/ground-setting/',
                items: [
                    {text: 'Übersicht', link: '/management-area/ground-setting/overview'},
                    {text: 'Dialog', link: '/management-area/ground-setting/dialog'},
                ]
            },
            {
                text: 'Alarmierungen', link: '/management-area/incoming-alert/',
                items: [
                    {text: 'Übersicht', link: '/management-area/incoming-alert/overview'},
                    {text: 'Dialog', link: '/management-area/incoming-alert/dialog'},
                ]
            },
            {
                text: 'Mitteilungen', link: '/management-area/message/',
                items: [
                    {text: 'Übersicht', link: '/management-area/message/overview'},
                    {text: 'Dialog', link: '/management-area/message/dialog'},
                ]
            },
            {
                text: 'Icons-Mitteilungen', link: '/management-area/message-icon/',
                items: [
                    {text: 'Übersicht', link: '/management-area/message-icon/overview'},
                    {text: 'Dialog', link: '/management-area/message-icon/dialog'},
                ]
            },
            {
                text: 'Darstellung (CSS)', link: '/management-area/site-style/',
                items: [
                    {text: 'Übersicht', link: '/management-area/site-style/overview'},
                    {text: 'Dialog', link: '/management-area/site-style/dialog'},
                ]
            },
            {
                text: 'Versionen', link: '/management-area/version/',
                items: [
                    {text: 'Übersicht', link: '/management-area/version/overview'},
                    {text: 'Dialog', link: '/management-area/version/dialog'},
                ]
            },
        ]
    }
]