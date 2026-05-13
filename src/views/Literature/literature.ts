import { ItemView, WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import type LiteratureSearchPlugin from "../../main";
import QueryClienProvider from "../../lib/queryClienProvider.svelte";
import Literature, { type LiteratureProps } from "./Literature.svelte";

export const Connected_Literature = "connected-literature";

export class ConnectedLiterature extends ItemView {
	private component: ReturnType<typeof mount> | null = null;

	constructor(
		leaf: WorkspaceLeaf,
		private plugin: LiteratureSearchPlugin,
	) {
		super(leaf);
		this.icon = "book-open-text";
	}

	getViewType() {
		return Connected_Literature;
	}

	getDisplayText() {
		return "Connected Literature";
	}

	async onOpen() {
		const container = this.contentEl;
		this.component = mount(QueryClienProvider<LiteratureProps>, {
			target: container,
			props: {
				plugin: this.plugin,
				component: Literature,
				componentProps: { plugin: this.plugin },
			},
		});
	}

	async onClose() {
		if (this.component) {
			unmount(this.component);
			this.component = null;
		}
	}
}
