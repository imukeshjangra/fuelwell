import type { Config } from 'tailwindcss';

/**
 * Fuelwell design tokens. Colours, shadows, keyframes and animations live here;
 * component styles live in /styles/*.css (all compiled by Tailwind).
 */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: '#F5F8FF',
        ink: '#0F1B2D',
        tang: '#FF7A1A',
        teal: '#0B6E70',
        mist: '#DDE5EE',
        // vibrant accents used by gradients, chips and glows
        aqua: '#14C8B4',
        sun: '#FFC53D',
        coral: '#FF5A7A',
        violet: '#7C5CFF',
        sky: '#2EA8FF',
        lime: '#7ED957',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,27,45,.06), 0 8px 24px -12px rgba(15,27,45,.18)',
        lift: '0 2px 4px rgba(15,27,45,.08), 0 18px 40px -16px rgba(15,27,45,.35)',
        glow: '0 10px 40px -10px rgba(255,122,26,.55)',
        'glow-teal': '0 10px 40px -10px rgba(20,200,180,.55)',
        inner: 'inset 0 1px 0 rgba(255,255,255,.7)',
      },
      fontFamily: {
        display: ['var(--display)', 'system-ui', 'sans-serif'],
        body: ['var(--body)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'grad-sunrise': 'linear-gradient(135deg,#FF7A1A 0%,#FFB347 55%,#FFD66B 100%)',
        'grad-ocean': 'linear-gradient(135deg,#0B6E70 0%,#14C8B4 100%)',
        'grad-berry': 'linear-gradient(135deg,#7C5CFF 0%,#FF5A7A 100%)',
        'grad-night': 'linear-gradient(135deg,#0F1B2D 0%,#16345A 60%,#0B6E70 140%)',
        'grid-dots': 'radial-gradient(rgba(15,27,45,.09) 1.2px,transparent 1.2px)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.34,1.56,.64,1)',
        out: 'cubic-bezier(.22,1,.36,1)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(.92)' }, to: { opacity: '1', transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-14px) rotate(1.5deg)' } },
        'float-slow': { '0%,100%': { transform: 'translateY(0) translateX(0)' }, '50%': { transform: 'translateY(-10px) translateX(6px)' } },
        blob: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(40px,-30px) scale(1.12)' }, '66%': { transform: 'translate(-30px,25px) scale(.92)' } },
        shimmer: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '200% 50%' } },
        'gradient-x': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        orbit: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'ring-pulse': { '0%': { transform: 'scale(.9)', opacity: '.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '60%': { transform: 'scale(1.12)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        wiggle: { '0%,100%': { transform: 'rotate(0)' }, '25%': { transform: 'rotate(-8deg)' }, '75%': { transform: 'rotate(8deg)' } },
        sweep: { from: { transform: 'translateX(-120%) skewX(-18deg)' }, to: { transform: 'translateX(220%) skewX(-18deg)' } },
        'page-in': { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'none' } },
        'line-grow': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .8s cubic-bezier(.22,1,.36,1) both',
        'fade-in': 'fade-in .8s ease both',
        'scale-in': 'scale-in .6s cubic-bezier(.34,1.56,.64,1) both',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
        shimmer: 'shimmer 5s linear infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        marquee: 'marquee 38s linear infinite',
        orbit: 'orbit 24s linear infinite',
        'ring-pulse': 'ring-pulse 2.4s ease-out infinite',
        pop: 'pop .55s cubic-bezier(.34,1.56,.64,1) both',
        wiggle: 'wiggle .6s ease-in-out',
        sweep: 'sweep 1.1s ease-in-out',
        'page-in': 'page-in .45s cubic-bezier(.22,1,.36,1) both',
        'line-grow': 'line-grow .9s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
