/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          '50': "hsl(220, 100%, 98%)",
          '100': "hsl(220, 100%, 95%)",
          '200': "hsl(220, 96%, 90%)",
          '300': "hsl(220, 92%, 85%)",
          '400': "hsl(220, 88%, 70%)",
          '500': "hsl(220, 84%, 60%)",
          '600': "hsl(220, 80%, 50%)",
          '700': "hsl(220, 76%, 40%)",
          '800': "hsl(220, 72%, 35%)",
          '900': "hsl(220, 68%, 30%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          '100': "hsl(215, 16%, 93%)",
          '200': "hsl(215, 14%, 85%)",
          '300': "hsl(215, 12%, 75%)",
          '400': "hsl(215, 10%, 65%)",
          '500': "hsl(215, 8%, 50%)",
          '600': "hsl(215, 12%, 40%)",
          '700': "hsl(215, 16%, 30%)",
          '800': "hsl(215, 20%, 20%)",
          '900': "hsl(215, 24%, 10%)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
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
      },
    },
  },
  plugins: []
} 