import { mount } from "svelte";
import type LiteratureSearchPlugin from "../../main";
import { PluginSettingTab } from "obsidian";
import QueryClienProvider from "../../lib/queryClienProvider.svelte";
import Settings, { type SettingsProps } from "./Settings.svelte";

export class SettingsTab extends PluginSettingTab {
	constructor(private plugin: LiteratureSearchPlugin) {
		super(plugin.app, plugin);
	}

	display(): void {
		this.containerEl.empty();
		mount(QueryClienProvider<SettingsProps>, {
			target: this.containerEl,
			props: {
				plugin: this.plugin,
				component: Settings,
				componentProps: { plugin: this.plugin },
			},
		});
	}
}
