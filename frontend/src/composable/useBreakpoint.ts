import {onMounted, onUnmounted, ref} from 'vue'

export function useBreakpoint() {
    const isMobile = ref(false)

    function update() {
        isMobile.value = window.innerWidth < 768 // md
    }

    onMounted(() => {
        update()
        window.addEventListener('resize', update)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', update)
    })

    return {isMobile}
}
