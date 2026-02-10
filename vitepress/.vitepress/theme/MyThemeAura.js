import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
export const MyThemeAura = definePreset(Aura, {
    semantic: {
        /* 🔵 Akzentfarbe (nur für Interaktion!) Tailwind-CSS (stone)*/
        primary: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c', // ⭐ Soft Stone
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
            950: '#0c0a09',
        }
    },
    colorScheme: {
        light: {
            surface: {
                ground: '#fafaf9', // Stone  50    // App Background
                section: '#f5f5f4', // Stone 100    // Cards / Panels
                border: '#d6d3d1', // Stone 300
                hover: '#a8a29e' // Stone 400
            },
            text: {
                color: '#0c0a09', // Stone 950
                secondary: '#71717a' // Zink  400
            }
        },
        dark: {
            surface: {
                ground: '#1c1917', // Stone 950     // App Background
                section: '#292524', // Stone 800     // Cards / Panels
                border: '#57534e', // Stone 600
                hover: '#a8a29e' // Stone 400
            },
            text: {
                color: '#fafaf9', // Stone  50
                secondary: '#f4f4f5' // Zink  200
            }
        }
    }
});
