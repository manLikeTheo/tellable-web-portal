// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/playback/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // FONT FAMILIES - Vogue-style serif for headings
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      colors: {
        // AwaChapter Brand Colors - CHARCOAL & GOLD
        awa: {
          // Charcoal Palette (from logo)
          charcoal: {
            DEFAULT: "#1A1A1A", // Updated to match your spec
            light: "#2B2B2B",
            lighter: "#3A3A3A",
            dark: "#0F0F0F",
          },

          // Gold Palette (from logo) - REFINED
          gold: {
            DEFAULT: "#C9A961", // Your accurate gold
            light: "#D4B574",
            dark: "#B89650",
            pale: "#E8D4B8",
          },
        },
      },

      // Prebuilt gradients
      backgroundImage: {
        // Scrim gradients (for overlays)
        "scrim-bottom":
          "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
        "scrim-top":
          "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",

        // Brand gradients
        "awa-gradient":
          "linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 50%, #1A1A1A 100%)",
        "awa-gold": "linear-gradient(135deg, #C9A961 0%, #D4B574 100%)",
      },

      // Border radius
      borderRadius: {
        awa: "1.5rem",
        "awa-lg": "2rem",
        "awa-xl": "3rem",
      },

      // Shadow presets
      boxShadow: {
        awa: "0 10px 40px rgba(201, 169, 97, 0.15)",
        "awa-gold": "0 20px 60px rgba(201, 169, 97, 0.4)",
        "awa-glow": "0 0 40px rgba(201, 169, 97, 0.3)",
      },

      // Animation keyframes
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      // Animation utilities
      animation: {
        kenburns: "kenburns 20s ease-in-out infinite alternate",
        fadeIn: "fadeIn 0.6s ease-out",
        slideUp: "slideUp 0.6s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;

// // tailwind.config.ts - SIMPLIFIED VERSION
// import type { Config } from "tailwindcss";

// export default {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         serif: ["var(--font-serif)", "Georgia", "serif"],
//         sans: ["var(--font-sans)", "system-ui", "sans-serif"],
//       },
//       colors: {
//         "awa-charcoal": "#1A1A1A",
//         "awa-charcoal-light": "#2B2B2B",
//         "awa-charcoal-lighter": "#3A3A3A",
//         "awa-charcoal-dark": "#0F0F0F",
//         "awa-gold": "#C9A961",
//         "awa-gold-light": "#D4B574",
//         "awa-gold-dark": "#B89650",
//         "awa-gold-pale": "#E8D4B8",
//       },
//       backgroundImage: {
//         "scrim-bottom":
//           "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
//         "scrim-top":
//           "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
//         "awa-gradient":
//           "linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 50%, #1A1A1A 100%)",
//         "awa-gold": "linear-gradient(135deg, #C9A961 0%, #D4B574 100%)",
//       },
//       borderRadius: {
//         awa: "1.5rem",
//         "awa-lg": "2rem",
//         "awa-xl": "3rem",
//       },
//       boxShadow: {
//         awa: "0 10px 40px rgba(201, 169, 97, 0.15)",
//         "awa-gold": "0 20px 60px rgba(201, 169, 97, 0.4)",
//         "awa-glow": "0 0 40px rgba(201, 169, 97, 0.3)",
//       },
//       keyframes: {
//         kenburns: {
//           "0%": { transform: "scale(1)" },
//           "100%": { transform: "scale(1.1)" },
//         },
//         fadeIn: {
//           "0%": { opacity: "0" },
//           "100%": { opacity: "1" },
//         },
//         slideUp: {
//           "0%": { transform: "translateY(20px)", opacity: "0" },
//           "100%": { transform: "translateY(0)", opacity: "1" },
//         },
//       },
//       animation: {
//         kenburns: "kenburns 20s ease-in-out infinite alternate",
//         fadeIn: "fadeIn 0.6s ease-out",
//         slideUp: "slideUp 0.6s ease-out",
//       },
//     },
//   },
//   plugins: [],
// } satisfies Config;
