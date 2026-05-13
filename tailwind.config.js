/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				accent: {
					DEFAULT: "var(--color-accent)",
				},
				base: {
					"00": "var(--color-base-00)",
					"05": "var(--color-base-05)",
					10: "var(--color-base-10)",
					20: "var(--color-base-20)",
					25: "var(--color-base-25)",
					30: "var(--color-base-30)",
					35: "var(--color-base-35)",
					40: "var(--color-base-40)",
					50: "var(--color-base-50)",
					60: "var(--color-base-60)",
					70: "var(--color-base-70)",
					100: "var(--color-base-100)",
				},
				background: {
					primary: "var(--background-primary)",
					"primary-alt": "var(--background-primary-alt)",
					secondary: "var(--background-secondary)",
					"secondary-alt": "var(--background-secondary-alt)",
				},
				text: {
					normal: "var(--text-normal)",
					muted: "var(--text-muted)",
					faint: "var(--text-faint)",
					"on-accent": "var(--text-on-accent)",
					accent: "var(--text-accent)",
					"accent-hover": "var(--text-accent-hover)",
				},
				interactive: {
					normal: "var(--interactive-normal)",
					hover: "var(--interactive-hover)",
					accent: "var(--interactive-accent)",
					"accent-hover": "var(--interactive-accent-hover)",
				},
				"bg-modifier": {
					hover: "var(--background-modifier-hover)",
					border: "var(--background-modifier-border)",
					"border-hover": "var(--background-modifier-border-hover)",
					"border-focus": "var(--background-modifier-border-focus)",
					"form-field": "var(--background-modifier-form-field)",
				},
			},
			borderRadius: {
				"radius-s": "var(--radius-s)",
				"radius-m": "var(--radius-m)",
				"radius-l": "var(--radius-l)",
			},
			fontSize: {
				"font-smallest": "var(--font-smallest)",
				"font-smaller": "var(--font-smaller)",
				"font-small": "var(--font-small)",
				"ui-smaller": "var(--font-ui-smaller)",
				"ui-small": "var(--font-ui-small)",
				"ui-medium": "var(--font-ui-medium)",
				"ui-large": "var(--font-ui-large)",
			},
			fontFamily: {
				interface: "var(--font-interface-theme)",
				text: "var(--font-text-theme)",
				mono: "var(--font-monospace-theme)",
			},
		},
	},
	corePlugins: {
		preflight: false,
	},
	plugins: [],
};
