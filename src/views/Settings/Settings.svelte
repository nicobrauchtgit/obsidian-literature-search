<script lang="ts">
    import Select from "../../components/Select.svelte";
    import SettingGroup from "../../components/SettingGroup.svelte";
    import SettingItem from "../../components/SettingItem.svelte";
    import type LiteratureSearchPlugin from "../../main";

    export type SettingsProps = {
        plugin: LiteratureSearchPlugin;
    };
    let { plugin }: SettingsProps = $props();

    const secrets = $derived(
        plugin.app.secretStorage.listSecrets().map((secretKey) => {
            return { label: secretKey, value: secretKey };
        }),
    );

    const handleSettingPath = (
        e: FocusEvent & { currentTarget: HTMLInputElement },
    ) => {
        const path = e.currentTarget.value.trim();
        plugin.settings.literatureNotePath = path;
    };
</script>

<SettingGroup>
    <SettingItem
        name="Scholar API Key"
        desc="Api Key to interact with Semantic Scholars Api"
    >
        <Select
            type="single"
            items={secrets}
            value={plugin.settings.apiKey ?? ""}
            onchange={(v) => (plugin.settings.apiKey = v)}
        />
    </SettingItem>
    <SettingItem
        name="Literature Directory"
        desc="Path where the literature notes should be stored"
    >
        <input
            type="text"
            value={plugin.settings.literatureNotePath}
            onblur={handleSettingPath}
        />
    </SettingItem>
</SettingGroup>
