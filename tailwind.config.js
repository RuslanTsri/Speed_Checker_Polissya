/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      // 🎨 ПАЛІТРА КОЛЬОРІВ З ФІГМИ
      colors: {
        brand: {
          orange: '#FF6D00',      // Головний акцент
          orangeDark: '#CA4402',  // Темний помаранчевий (наприклад, для градієнтів)
          orangeLight: '#FCAE0E', // Світлий помаранчевий
          yellow: '#FFF958',      // Жовтий акцент
          light: '#F5F5F5',       // Залишено для сумісності з твоїм старим кодом
          gray: '#C3C3C3'         // Залишено для сумісності з твоїм старим кодом
        },
        surface: {
          bg: '#0A0A0A',          // Глобальний фон додатку
          card: '#1C1C1E',        // Фон карток (Mod, PlayerMod)
          cardPressed: '#111111', // Фон натиснутої картки на Android
          border: '#262626',      // Колір обводок та роздільників
        },
        status: {
          success: '#34d399',     // Зелений (Ready, Success)
          error: '#f87171',       // Червоний (Stop, Error)
          warning: '#facc15',     // Жовтий (Waiting)
        },
        text: {
          main: '#F5F5F5',        // Основний текст (білий)
          sub: '#A3A3A3',         // Вторинний текст (світло-сірий)
          muted: '#717171',       // Вимкнений/Тьмяний текст (темно-сірий)
        }
      },

      // ✍️ СІМЕЙСТВА ШРИФТІВ
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'],
        evolventa: ['Evolventa', 'sans-serif'],
      },

      // 📏 ТИПОГРАФІЧНА ШКАЛА (Розмір + Міжрядковий інтервал)
      fontSize: {
        'h1': ['32px', { lineHeight: '40px' }],
        'h2': ['24px', { lineHeight: '32px' }],
        'h3': ['20px', { lineHeight: '28px' }],
        'h4': ['16px', { lineHeight: '24px' }],
        'body': ['14px', { lineHeight: '20px' }],
        'small': ['12px', { lineHeight: '16px' }],
        'caption': ['10px', { lineHeight: '14px' }],
      }
    },
  },
  plugins: [],
}