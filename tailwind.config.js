/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Refined accent palette
        accent: {
          blue: {
            DEFAULT: '#6CB4EE',
            deep: '#4A90D9',
            light: '#8EC8F6',
            50: 'rgba(108, 180, 238, 0.05)',
            100: 'rgba(108, 180, 238, 0.1)',
            200: 'rgba(108, 180, 238, 0.2)',
            300: 'rgba(108, 180, 238, 0.3)',
          },
          lavender: {
            DEFAULT: '#B8A9E8',
            deep: '#9B8AD4',
            light: '#D0C5F0',
            50: 'rgba(184, 169, 232, 0.05)',
            100: 'rgba(184, 169, 232, 0.1)',
            200: 'rgba(184, 169, 232, 0.2)',
            300: 'rgba(184, 169, 232, 0.3)',
          },
          teal: {
            DEFAULT: '#7EC8C8',
            deep: '#5BA3A3',
            light: '#A0DADA',
            50: 'rgba(126, 200, 200, 0.05)',
            100: 'rgba(126, 200, 200, 0.1)',
            200: 'rgba(126, 200, 200, 0.2)',
            300: 'rgba(126, 200, 200, 0.3)',
          },
        },
        // Canvas backgrounds
        canvas: {
          light: {
            from: '#FDF8F4',  // warm cream
            to: '#FFFFFF',
          },
          dark: {
            from: '#1A1B2E',  // charcoal with blue hint
            to: '#0F1017',    // near-black
          },
        },
        // Glass surfaces
        glass: {
          light: 'rgba(255, 255, 255, 0.72)',
          'light-hover': 'rgba(255, 255, 255, 0.85)',
          dark: 'rgba(22, 23, 38, 0.72)',
          'dark-hover': 'rgba(22, 23, 38, 0.85)',
          border: {
            light: 'rgba(255, 255, 255, 0.35)',
            dark: 'rgba(255, 255, 255, 0.08)',
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI Variable', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'card': '14px',
        'panel': '16px',
        'button': '8px',
        'pill': '9999px',
        'input': '10px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.32), 0 2px 8px rgba(0, 0, 0, 0.16)',
        'glass-dark-lg': '0 16px 48px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.24)',
        'glow-blue': '0 0 20px rgba(108, 180, 238, 0.25), 0 0 6px rgba(108, 180, 238, 0.15)',
        'glow-lavender': '0 0 20px rgba(184, 169, 232, 0.25), 0 0 6px rgba(184, 169, 232, 0.15)',
        'glow-teal': '0 0 20px rgba(126, 200, 200, 0.25), 0 0 6px rgba(126, 200, 200, 0.15)',
        'toolbar': '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'toolbar-dark': '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fadeOut 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slideInLeft 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-top': 'slideInTop 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-up': 'scaleUp 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'backdrop-in': 'backdropIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'translateX(-50%) scale(0.92)', opacity: '0' },
          '100%': { transform: 'translateX(-50%) scale(1)', opacity: '1' },
        },
        backdropIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate.700'),
            '--tw-prose-headings': theme('colors.slate.900'),
            '--tw-prose-links': '#5BA3A3',
            '--tw-prose-bold': theme('colors.slate.900'),
            '--tw-prose-code': '#9B8AD4',
            lineHeight: '1.75',
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.slate.300'),
            '--tw-prose-headings': theme('colors.slate.100'),
            '--tw-prose-links': '#7EC8C8',
            '--tw-prose-bold': theme('colors.slate.100'),
            '--tw-prose-code': '#B8A9E8',
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
