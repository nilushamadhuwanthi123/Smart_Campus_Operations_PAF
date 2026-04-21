/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#F7F4EB',
          100: '#ECE6D6',
          200: '#DDD3B3',
          300: '#CDBF92',
          400: '#8A8FA1',
          500: '#30364F',
          600: '#2B3147',
          700: '#24293C',
          800: '#1F2436',
          900: '#171A28'
        },
        blue: {
          50: '#F4F7F8',
          100: '#E4EBEE',
          200: '#CCD8DE',
          300: '#ACBAC4',
          400: '#8A9AA4',
          500: '#6E7E89',
          600: '#55636D',
          700: '#424D56',
          800: '#313A41',
          900: '#21282E'
        },
        indigo: {
          50: '#FBF9F1',
          100: '#F3EEDB',
          200: '#E7DDB7',
          300: '#D8C995',
          400: '#C2B37B',
          500: '#A38E5F',
          600: '#86724D',
          700: '#66573C',
          800: '#4A3F2C',
          900: '#2F291C'
        },
        teal: {
          50: '#F5F8F7',
          100: '#E6EFEE',
          200: '#CBDCDC',
          300: '#AFC8C8',
          400: '#8DAAAA',
          500: '#708B8B',
          600: '#596E6E',
          700: '#445656',
          800: '#324040',
          900: '#212B2B'
        },
        cyan: {
          50: '#F4F7F8',
          100: '#E1EAED',
          200: '#C5D6DC',
          300: '#A6BEC7',
          400: '#86A5B1',
          500: '#678492',
          600: '#506874',
          700: '#3F525A',
          800: '#2E3D43',
          900: '#1E292D'
        },
        brand: {
          navy: '#30364F',
          purple: '#30364F',
          blue: '#ACBAC4',
          mist: '#ACBAC4',
          sand: '#E1D9BC',
          cream: '#F0F0DB',
          ink: '#22283C',
          bg: '#F7F4EA',
          dark: '#1F2436',
          surface: '#2B3147',
          'surface-hover': '#39415D',
          line: '#D7D0B7',
          'line-dark': '#46506E'
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        soft: '0 22px 50px -28px rgba(48, 54, 79, 0.35)',
        glow: '0 24px 70px -24px rgba(48, 54, 79, 0.45)',
        panel: '0 18px 40px -28px rgba(48, 54, 79, 0.45)'
      }
    }
  },
  plugins: []
};
