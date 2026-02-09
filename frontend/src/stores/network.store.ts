import {defineStore} from 'pinia'

export const useNetworkStore = defineStore('network', {
    state: () => ({
        online: navigator.onLine,
        startedOffline: !navigator.onLine,
        shouldReloadAfterOnline: false,

    }),

    actions: {
        setOnline(value: boolean) {
            // Übergang offline → online erkennen
            if (value && !this.online && this.startedOffline) {
                console.log('🟡 online after offline start → reload needed')
                this.shouldReloadAfterOnline = true
            }

            this.online = value
        },

        init() {
            const update = () => {
                this.setOnline(navigator.onLine)
            }

            window.addEventListener('online', update)
            window.addEventListener('offline', update)

            // 🔁 Fallback Polling (PWA / iOS Fix)
            setInterval(update, 5000)
        },

        clearReloadFlag() {
            this.shouldReloadAfterOnline = false
            this.startedOffline = false
        },
    },
})
