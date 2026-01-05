module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			'sakura-pink': '#FFBAD2',
  			'sakura-light': '#FFE4EC',
  			'sakura-white': '#FFF5F8',
  			'petal-light': '#FFE4EC',
  			'plum-dark': '#6B4E71',
  			'sake-mist': '#E8F4F8',
  			'sake-warm': '#FFE5C4',
  			matcha: '#98D4A8',
  			ink: '#2D2D2D',
  			'gray-600': '#4B5563',
  			'gray-400': '#9CA3AF',
  			white: '#FFFFFF',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			display: [
  				'Space Grotesk',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'sans-serif'
  			],
  			japanese: [
  				'Noto Sans JP',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'12px',
  				'16px'
  			],
  			sm: [
  				'14px',
  				'20px'
  			],
  			base: [
  				'16px',
  				'24px'
  			],
  			lg: [
  				'18px',
  				'28px'
  			],
  			xl: [
  				'20px',
  				'28px'
  			],
  			'2xl': [
  				'24px',
  				'32px'
  			],
  			'3xl': [
  				'30px',
  				'36px'
  			],
  			'4xl': [
  				'36px',
  				'40px'
  			]
  		},
  		spacing: {
  			'1': '4px',
  			'2': '8px',
  			'3': '12px',
  			'4': '16px',
  			'6': '24px',
  			'8': '32px',
  			'12': '48px',
  			'16': '64px'
  		},
  		borderRadius: {
  			DEFAULT: '4px',
  			lg: 'var(--radius)',
  			xl: '12px',
  			'2xl': '16px',
  			full: '9999px',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		borderWidth: {
  			'2': '2px',
  			'3': '3px',
  			'4': '4px',
  			DEFAULT: '1px'
  		},
  		boxShadow: {
  			retro: '4px 4px 0px #2D2D2D',
  			'retro-lg': '6px 6px 0px #2D2D2D',
  			'retro-sm': '2px 2px 0px #2D2D2D',
  			'retro-pink': '4px 4px 0px #6B4E71'
  		},
  		animation: {
  			pulse: 'pulse 2s infinite',
  			soundwave: 'soundwave 0.5s infinite',
  			fadeIn: 'fadeIn 0.2s ease',
  			slideUp: 'slideUp 0.3s ease',
  			bounce: 'bounce 0.5s ease'
  		},
  		keyframes: {
  			soundwave: {
  				'0%, 100%': {
  					height: '8px'
  				},
  				'50%': {
  					height: '20px'
  				}
  			},
  			pulse: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		screens: {
  			xs: '0px',
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1440px'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/typography'),
      require("tailwindcss-animate")
],
}
