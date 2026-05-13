import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import builtinModules from "builtin-modules";

const setOutDir = (mode: string) => {
	switch (mode) {
		case "development":
			return "./build/obsidian-literature-search/";
		case "production":
			return "./build/prod";
		default:
			console.warn(
				`Unexpected mode: "${mode}". Defaulting to development output directory.`,
			);
			return "./build/obsidian-literature-search/";
	}
};

export default defineConfig(({ mode }) => {
	const isDevelopment = mode === "development";
	if (isDevelopment) {
		process.env.NODE_ENV = "development";
	}

	return {
		plugins: [
			svelte({
				preprocess: vitePreprocess(),
				compilerOptions: {
					dev: isDevelopment,
				},
				onwarn: (warning, handler) => {
					if (warning.code && warning.code.startsWith("a11y")) return;
					handler(warning);
				},
			}),
		],
		resolve: {
			conditions: isDevelopment ? ["development", "browser"] : ["browser"],
		},
		define: {
			"import.meta.env.DEV": JSON.stringify(isDevelopment),
			"process.env.NODE_ENV": JSON.stringify(
				isDevelopment ? "development" : "production",
			),
		},
		build: {
			minify: !isDevelopment,
			lib: {
				entry: "src/main.ts",
				formats: ["cjs"],
				fileName: () => "main.js",
			},
			rollupOptions: {
				treeshake: isDevelopment ? false : true,
				output: {
					entryFileNames: "main.js",
					assetFileNames: "styles.css",
					sourcemapBaseUrl: new URL(
						setOutDir(mode),
						import.meta.url,
					).toString(),
					manualChunks: undefined,
					inlineDynamicImports: true,
				},
				external: [
					"obsidian",
					"electron",
					"@codemirror/autocomplete",
					"@codemirror/collab",
					"@codemirror/commands",
					"@codemirror/language",
					"@codemirror/lint",
					"@codemirror/search",
					"@codemirror/state",
					"@codemirror/view",
					"@lezer/common",
					"@lezer/highlight",
					"@lezer/lr",
					...builtinModules,
				],
			},
			outDir: setOutDir(mode),
			emptyOutDir: mode === "production",
			sourcemap: isDevelopment,
		},
		css: {
			devSourcemap: isDevelopment,
		},
	};
});
