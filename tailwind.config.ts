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
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				'kiit-green': 'hsl(var(--kiit-green))',
				'kiit-green-light': 'hsl(var(--kiit-green-light))',
				'kiit-green-dark': 'hsl(var(--kiit-green-dark))',
				'kiit-green-soft': 'hsl(var(--kiit-green-soft))',
				'campus-blue': 'hsl(var(--campus-blue))',
				'campus-orange': 'hsl(var(--campus-orange))',
				'campus-purple': 'hsl(var(--campus-purple))',
				
				// KIIT Primary/Secondary for compatibility
				'kiit-primary': 'hsl(var(--kiit-primary))',
				'kiit-secondary': 'hsl(var(--kiit-secondary))',
				
				// Society Brand Colors
				'fedkiit-green': 'hsl(var(--fedkiit-green))',
				'fedkiit-black': 'hsl(var(--fedkiit-black))',
				'fedkiit-grey': 'hsl(var(--fedkiit-grey))',
				'fedkiit-light-grey': 'hsl(var(--fedkiit-light-grey))',
				'ecell-black': 'hsl(var(--ecell-black))',
				'ecell-white': 'hsl(var(--ecell-white))',
				'ecell-cyan': 'hsl(var(--ecell-cyan))',
				'usc-orange': 'hsl(var(--usc-orange))',
				'usc-maroon': 'hsl(var(--usc-maroon))',
				'usc-green': 'hsl(var(--usc-green))',
				'usc-white': 'hsl(var(--usc-white))',
				'usc-black': 'hsl(var(--usc-black))',
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
