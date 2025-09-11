/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        'text-secondary': '#6B7280',
      },
      fontFamily: {
        'sans': ['System'],
      },
    },
  },
  plugins: [],
}
