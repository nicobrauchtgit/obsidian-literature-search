import { App, Plugin, type PluginManifest, WorkspaceLeaf } from "obsidian";
import "./styles.css";

import { LiteratureSearch } from "./views/PaperSearch/searchView";
import { QueryClient } from "@tanstack/svelte-query";
import { SettingsTab } from "./views/Settings/settings";
import { PluginSettings } from "./settings";
import {
	Connected_Literature,
	ConnectedLiterature,
} from "./views/Literature/literature";
import { LiteratureDB } from "./lib/db";

export default class LiteratureSearchPlugin extends Plugin {
	queryClient: QueryClient;
	settings!: PluginSettings;
	db: LiteratureDB;
	vaultPaperIds: Set<string> = new Set();

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.db = new LiteratureDB();
		this.queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: 1000 * 60 * 5, // 5 minutes
					gcTime: 1000 * 60 * 10, // 10 minutes
					retry: false,
					refetchOnWindowFocus: false,
				},
			},
		});
	}

	async onload() {
		this.settings = new PluginSettings(
			await this.loadData(),
			this.app,
			(data) => this.saveData(data),
		);

		this.addCommand({
			id: "open-paper-search",
			name: "Search Literature",
			icon: "book",
			callback: () => new LiteratureSearch(this).open(),
		});

		this.registerView(
			Connected_Literature,
			(leaf) => new ConnectedLiterature(leaf, this),
		);

		this.addCommand({
			id: "open-connected-literature",
			name: "Open Connected Literature",
			icon: "book-open-text",
			callback: () => this.activateView(),
		});

		this.addSettingTab(new SettingsTab(this));

		// Build the set of paperIds in the vault
		this.app.workspace.onLayoutReady(() => {
			this.loadVaultPaperIds();
		});
	}

	loadVaultPaperIds() {
		const ids = new Set<string>();
		const files = this.app.vault.getMarkdownFiles();
		for (const file of files) {
			const cache = this.app.metadataCache.getFileCache(file);
			const id = cache?.frontmatter?.paperId;
			if (id) ids.add(id);
		}
		this.vaultPaperIds = ids;
	}

	addVaultPaperId(paperId: string) {
		this.vaultPaperIds.add(paperId);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(Connected_Literature);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			await leaf!.setViewState({ type: Connected_Literature, active: true });
		}

		workspace.revealLeaf(leaf!);
	}

	async onunload() {}
}
