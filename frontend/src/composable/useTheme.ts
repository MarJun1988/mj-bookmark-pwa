import {ref} from 'vue'

const THEME_KEY = 'theme'
const isDark = ref(false)

export const useTheme = () => {
    const applyTheme = (theme: 'dark' | 'light') => {
        const html = document.documentElement

        html.classList.remove('dark', 'light')
        html.classList.add(theme)
        html.setAttribute('data-theme', theme)

        isDark.value = theme === 'dark'
        localStorage.setItem(THEME_KEY, theme)
    }

    const toggleTheme = () => {
        applyTheme(isDark.value ? 'light' : 'dark')
    }

    const initTheme = () => {
        const stored = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null
        const system =
            window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'

        applyTheme(stored ?? system)
    }

    return {
        isDark,
        toggleTheme,
        initTheme
    }
}
