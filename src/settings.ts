import { z } from "zod";
import type { App } from "obsidian";

const SettingsSchema = z.object({
	apiKey: z.string().optional(),
	defaultLimit: z.number().min(1).max(100).default(100),
	literatureNotePath: z.string().optional(),
});

type SettingsData = z.infer<typeof SettingsSchema>;

function parseSettings(data: unknown, secretKeys: string[]): SettingsData {
	const obj = typeof data === "object" && data !== null ? data : {};
	const apiKey = SettingsSchema.shape.apiKey.safeParse((obj as any).apiKey);
	const defaultLimit = SettingsSchema.shape.defaultLimit.safeParse(
		(obj as any).defaultLimit,
	);
	const literatureNotePath = SettingsSchema.shape.literatureNotePath.safeParse(
		(obj as any).literatureNotePath,
	);

	const parsedApiKey = apiKey.success ? apiKey.data : undefined;
	const validApiKey =
		parsedApiKey && secretKeys.includes(parsedApiKey)
			? parsedApiKey
			: undefined;

	return {
		apiKey: validApiKey,
		defaultLimit: defaultLimit.success ? defaultLimit.data : 100,
		literatureNotePath: literatureNotePath.success
			? literatureNotePath.data
			: undefined,
	};
}

export class PluginSettings {
	#apiKey?: string = undefined;
	#defaultLimit: number = 100;
	#literatureNotePath?: string = undefined;
	#save: () => Promise<void>;

	constructor(data: unknown, app: App, save: (data: any) => Promise<void>) {
		const secretKeys = app.secretStorage.listSecrets();
		const parsed = parseSettings(data, secretKeys);
		this.#apiKey = parsed.apiKey;
		this.#defaultLimit = parsed.defaultLimit;
		this.#literatureNotePath = parsed.literatureNotePath;
		this.#save = () => save(this.toJSON());
	}

	get apiKey(): string | undefined {
		return this.#apiKey;
	}

	set apiKey(value: string) {
		this.#apiKey = value;
		this.#save();
	}

	get defaultLimit(): number {
		return this.#defaultLimit;
	}

	set defaultLimit(value: number) {
		this.#defaultLimit = value;
		this.#save();
	}

	get literatureNotePath(): string | undefined {
		return this.#literatureNotePath;
	}

	set literatureNotePath(value: string | undefined) {
		this.#literatureNotePath = value;
		this.#save();
	}

	toJSON() {
		return {
			apiKey: this.#apiKey,
			defaultLimit: this.#defaultLimit,
			literatureNotePath: this.#literatureNotePath,
		};
	}
}
