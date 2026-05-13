import { setIcon } from "obsidian";

export function icon(node: HTMLElement, iconId: string) {
	setIcon(node, iconId);

	return {
		update(newIconId: string) {
			setIcon(node, newIconId);
		},
	};
}
