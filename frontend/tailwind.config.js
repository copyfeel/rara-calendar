/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  future: {
    // hover: 클래스를 @media (hover: hover)로 감싸서
    // 터치 기기(모바일)에서는 hover 효과가 발동하지 않도록 함
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        pastel: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716b',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          accent: '#ffc0cb',
          orange: '#ffa500',
        }
      }
    },
  },
  plugins: [],
}
