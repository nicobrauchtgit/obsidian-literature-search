<script lang="ts">
    import type LiteratureSearchPlugin from "../../main";
    import type { StoredPaper } from "../../lib/db";
    import LiteratureCard from "./LiteratureCard.svelte";
    import { createQuery } from "@tanstack/svelte-query";
    import Filter from "./Filter.svelte";

    interface Props {
        plugin: LiteratureSearchPlugin;
        paperId: string;
        activeTab: "references" | "citations";
    }

    let { plugin, paperId, activeTab }: Props = $props();

    const edgeType = $derived(
        activeTab === "references" ? "reference" : "citation",
    );

    const papers = createQuery(() => ({
        queryKey: ["literature", paperId, edgeType],
        queryFn: async (): Promise<StoredPaper[]> => {
            const edges = await plugin.db.edges
                .where({ sourcePaperId: paperId, type: edgeType })
                .toArray();

            const targetIds = edges.map((e) => e.targetPaperId);
            if (targetIds.length === 0) return [];

            return plugin.db.papers.where("paperId").anyOf(targetIds).toArray();
        },
    }));

    let filteredPapers = $state<StoredPaper[]>([]);
</script>

{#if papers.data && papers.data.length === 0}
    <div class="text-sm text-[--text-muted] text-center mt-4">
        No {activeTab} found for this paper.
    </div>
{:else if papers.data}
    <Filter papers={papers.data} bind:filteredPapers {paperId} />
    <div class="text-xs text-[--text-muted]">
        {#if filteredPapers.length !== papers.data.length}
            {filteredPapers.length} / {papers.data.length}
        {:else}
            {papers.data.length}
        {/if}
        {activeTab === "references" ? "reference" : "citation"}{papers.data
            .length !== 1
            ? "s"
            : ""}
    </div>
    <div class="flex flex-col gap-2 overflow-y-auto">
        {#each filteredPapers as paper (paper.paperId)}
            <LiteratureCard
                {paper}
                isInfluential={paper.influentialFor?.includes(paperId) ?? false}
                hasNote={plugin.vaultPaperIds.has(paper.paperId)}
            />
        {/each}
    </div>
{/if}
