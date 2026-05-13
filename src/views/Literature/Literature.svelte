<script lang="ts">
    import type LiteratureSearchPlugin from "../../main";
    import LiteratureList from "./LiteratureList.svelte";
    import RelationToggle from "./RelationToggle.svelte";

    export type LiteratureProps = {
        plugin: LiteratureSearchPlugin;
    };

    let { plugin }: LiteratureProps = $props();

    let activeTab = $state<"references" | "citations">("references");
    let activePaperId = $state<string | null>(null);

    // Listen to active leaf changes and extract paperId from frontmatter
    const handleActiveLeafChange = () => {
        const file = plugin.app.workspace.getActiveFile();
        if (!file) {
            activePaperId = null;
            return;
        }

        const cache = plugin.app.metadataCache.getFileCache(file);
        const paperId = cache?.frontmatter?.paperId;
        activePaperId = paperId ?? null;
    };

    // Register the workspace event on mount
    $effect(() => {
        handleActiveLeafChange();

        const ref = plugin.app.workspace.on(
            "active-leaf-change",
            handleActiveLeafChange,
        );

        return () => {
            plugin.app.workspace.offref(ref);
        };
    });
</script>

<div class="connected-literature flex flex-col gap-2 p-2 h-full">
    <RelationToggle bind:activeTab />

    {#if activePaperId}
        <LiteratureList {plugin} paperId={activePaperId} {activeTab} />
    {:else}
        <div class="text-sm text-[--text-muted] text-center mt-4">
            Open a literature note to see its {activeTab}.
        </div>
    {/if}
</div>
