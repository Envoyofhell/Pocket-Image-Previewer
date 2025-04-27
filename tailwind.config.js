/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx,vue}',
      './*.html'
    ],
    theme: {
      extend: {
        colors: {
          forte: {
            primary: '#f87171',
            secondary: '#5a0866',
            dark: '#030711',
            panel: 'rgba(61, 5, 68, 0.9)',
            text: {
              primary: '#e2e8f0',
              secondary: '#a0aec0'
            }
          }
        },
        animation: {
          'text-flicker': 'text-flicker 3s linear infinite alternate',
          'float': 'float 6s ease-in-out infinite',
          'heartbeat': 'heartbeat 0.5s'
        },
        keyframes: {
          'text-flicker': {
            '0%, 10%, 12%, 20%, 22%, 30%, 32%, 40%, 42%, 50%, 52%, 60%, 62%, 70%, 72%, 80%, 82%, 90%, 92%, 100%': {
              'text-shadow': '0 0 5px rgba(255, 100, 100, 0.8), 0 0 10px rgba(255, 0, 0, 0.7), 0 0 18px rgba(138, 43, 226, 0.6), 0 0 25px rgba(75, 0, 130, 0.5)',
              'opacity': '1'
            },
            '11%, 21%, 31%, 41%, 51%, 61%, 71%, 81%, 91%': {
              'text-shadow': '0 0 4px rgba(255, 100, 100, 0.6), 0 0 8px rgba(255, 0, 0, 0.5), 0 0 15px rgba(138, 43, 226, 0.4), 0 0 20px rgba(75, 0, 130, 0.3)',
              'opacity': '0.95'
            }
          },
          'float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' }
          },
          'heartbeat': {
            '0%': { transform: 'scale(1)' },
            '14%': { transform: 'scale(1.3)' },
            '28%': { transform: 'scale(1)' },
            '42%': { transform: 'scale(1.3)' },
            '70%': { transform: 'scale(1)' }
          }
        }
      }
    },
    plugins: [],
  }