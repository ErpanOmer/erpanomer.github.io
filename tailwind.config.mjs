/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// GitHub Dark Theme Colors
				gh: {
					bg: '#0d1117',
					surface: '#161b22',
					border: '#30363d',
					text: '#c9d1d9',
					muted: '#8b949e',
				}
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
