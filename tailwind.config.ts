
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// FITFUSION vibrant color palette
				fitfusion: {
					purple: {
						light: '#c084fc', // Much brighter purple
						DEFAULT: '#9333ea', // Vibrant purple
						dark: '#7c2d12',  // Deep purple
					},
					blue: {
						light: '#60a5fa', // Bright blue
						DEFAULT: '#2563eb', // Vibrant blue
						dark: '#1d4ed8',   // Deep blue
					},
					green: {
						light: '#4ade80', // Bright green
						DEFAULT: '#16a34a', // Vibrant green
						dark: '#15803d',   // Deep green
					},
					orange: {
						light: '#fb923c', // Bright orange
						DEFAULT: '#ea580c', // Vibrant orange
						dark: '#c2410c',   // Deep orange
					},
					red: {
						light: '#f87171', // Bright red
						DEFAULT: '#dc2626', // Vibrant red
						dark: '#b91c1c',   // Deep red
					},
					yellow: {
						light: '#fbbf24', // Bright yellow
						DEFAULT: '#d97706', // Vibrant yellow
						dark: '#b45309',   // Deep yellow
					},
					pink: {
						light: '#f472b6', // Bright pink
						DEFAULT: '#db2777', // Vibrant pink
						dark: '#be185d',   // Deep pink
					},
					teal: {
						light: '#2dd4bf', // Bright teal
						DEFAULT: '#0d9488', // Vibrant teal
						dark: '#0f766e',   // Deep teal
					},
					indigo: {
						light: '#818cf8', // Bright indigo
						DEFAULT: '#4f46e5', // Vibrant indigo
						dark: '#3730a3',   // Deep indigo
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				"accordion-up": {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				"fade-in": {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" }
				},
				"fade-out": {
					"0%": { opacity: "1", transform: "translateY(0)" },
					"100%": { opacity: "0", transform: "translateY(10px)" }
				},
				"scale-in": {
					"0%": { transform: "scale(0.95)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" }
				},
				"slide-in": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(0)" }
				},
				"pulse-light": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.7" }
				},
				"shimmer": {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" }
				},
				"float": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" }
				},
				"gradient-shift": {
					"0%, 100%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" }
				},
				"glow": {
					"0%, 100%": { boxShadow: "0 0 5px rgba(147, 51, 234, 0.3)" },
					"50%": { boxShadow: "0 0 20px rgba(147, 51, 234, 0.6)" }
				}
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.5s ease-out forwards",
				"fade-out": "fade-out 0.3s ease-out forwards",
				"scale-in": "scale-in 0.3s ease-out forwards",
				"slide-in": "slide-in 0.4s ease-out forwards",
				"pulse-light": "pulse-light 2s infinite",
				"shimmer": "shimmer 2s infinite linear",
				"float": "float 3s ease-in-out infinite",
				"gradient-shift": "gradient-shift 3s ease-in-out infinite",
				"glow": "glow 2s ease-in-out infinite"
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Poppins', 'sans-serif']
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
				'rainbow': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)',
				'vibrant-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'fusion-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
				'energy-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
