import { Modal } from "obsidian";
import { mount } from "svelte";
import type LiteratureSearchPlugin from "../../main";
import QueryClientProvider from "../../lib/queryClienProvider.svelte";
import LiteratureSearchModal from "./LiteratureSearchModal.svelte";
import type { LiteratureSearchType } from "./LiteratureSearchModal.svelte";

export class LiteratureSearch extends Modal {
	constructor(private plugin: LiteratureSearchPlugin) {
		super(plugin.app);
		this.setTitle("Literature Search");
		this.modalEl.style.width = "75%";
		this.modalEl.style.maxWidth = "750px";
	}

	async onOpen(): Promise<void> {
		mount(QueryClientProvider<LiteratureSearchType>, {
			target: this.contentEl,
			props: {
				plugin: this.plugin,
				component: LiteratureSearchModal,
				componentProps: { plugin: this.plugin, close: () => this.close() },
			},
		});
		return super.onOpen();
	}
}
