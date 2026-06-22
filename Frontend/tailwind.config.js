import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "error-container": "#ffdad6",
        "on-tertiary-container": "#009668",
        "on-primary-container": "#7c839b",
        "primary-fixed": "#dae2fd",
        "surface-bright": "#f8f9ff",
        "on-secondary-fixed": "#001a42",
        "inverse-on-surface": "#eaf1ff",
        "surface-container-high": "#dce9ff",
        "tertiary": "#000000",
        "primary-fixed-dim": "#bec6e0",
        "surface-dim": "#cbdbf5",
        "tertiary-fixed": "#6ffbbe",
        "outline-variant": "#c6c6cd",
        "on-tertiary-fixed-variant": "#005236",
        "secondary-fixed-dim": "#adc6ff",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#131b2e",
        "surface-container-low": "#eff4ff",
        "inverse-primary": "#bec6e0",
        "on-error-container": "#93000a",
        "background": "#f8f9ff",
        "on-primary-fixed": "#131b2e",
        "on-secondary-fixed-variant": "#004395",
        "secondary": "#0058be",
        "on-primary": "#ffffff",
        "outline": "#76777d",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#45464d",
        "on-background": "#0b1c30",
        "secondary-container": "#2170e4",
        "surface-variant": "#d3e4fe",
        "tertiary-fixed-dim": "#4edea3",
        "surface-tint": "#565e74",
        "inverse-surface": "#213145",
        "surface-container": "#e5eeff",
        "on-error": "#ffffff",
        "tertiary-container": "#002113",
        "primary": "#000000",
        "secondary-fixed": "#d8e2ff",
        "surface": "#f8f9ff",
        "on-tertiary-fixed": "#002113",
        "error": "#ba1a1a",
        "on-secondary-container": "#fefcff",
        "on-secondary": "#ffffff",
        "surface-container-highest": "#d3e4fe",
        "on-tertiary": "#ffffff",
        "on-primary-fixed-variant": "#3f465c"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "base-unit": "4px",
        gutter: "16px",
        "container-margin": "24px"
      },
      fontFamily: {
        kantumruy: ["Kantumruy Pro", "serif"],
        "headline-md": ["Hanken Grotesk", "sans-serif"],
        "body-base": ["Hanken Grotesk", "sans-serif"],
        "data-tabular": ["Hanken Grotesk", "sans-serif"],
        "title-sm": ["Hanken Grotesk", "sans-serif"],
        "label-caps": ["Hanken Grotesk", "sans-serif"],
        "body-sm": ["Hanken Grotesk", "sans-serif"],
        "display-lg": ["Hanken Grotesk", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-base": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "data-tabular": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "title-sm": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "display-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "700" }]
      }
    },
  },
  plugins: [daisyui],
}