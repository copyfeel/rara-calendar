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
        // 테마별 값은 src/index.css 의 --pastel-* 변수 (관리자 화면 테마 설정)
        pastel: {
          50: 'rgb(var(--pastel-50) / <alpha-value>)',
          100: 'rgb(var(--pastel-100) / <alpha-value>)',
          200: 'rgb(var(--pastel-200) / <alpha-value>)',
          300: 'rgb(var(--pastel-300) / <alpha-value>)',
          400: 'rgb(var(--pastel-400) / <alpha-value>)',
          500: 'rgb(var(--pastel-500) / <alpha-value>)',
          600: 'rgb(var(--pastel-600) / <alpha-value>)',
          700: 'rgb(var(--pastel-700) / <alpha-value>)',
          800: 'rgb(var(--pastel-800) / <alpha-value>)',
          accent: '#ffc0cb',
          orange: '#ffa500',
        },
        // '학원' 카테고리용 올리브 그린
        olive: {
          100: '#dce3bf',
          700: '#5f6b2a',
        }
      }
    },
  },
  plugins: [],
}
