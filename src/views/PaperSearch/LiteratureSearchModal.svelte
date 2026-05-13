<script lang="ts">
    import { createQuery } from "@tanstack/svelte-query";
    import { searchPapers } from "../../lib/semanticScholarApi";
    import { createLiteratureNote } from "../../hooks/createLiteratureNote.svelte";
    import { fetchAndStoreRelations } from "../../hooks/fetchAndStoreRelations.svelte";
    import type { SearchQuery } from "../../lib/searchQuery";
    import type LiteratureSearchPlugin from "../../main";
    import SearchForm from "./SearchForm.svelte";
    import SearchResults from "./SearchResults.svelte";

    export type LiteratureSearchType = {
        plugin: LiteratureSearchPlugin;
        close: () => void;
    };

    let { plugin, close }: LiteratureSearchType = $props();

    const apiKey = $derived(plugin.settings.apiKey);

    type View = "search" | "results";
    let currentView = $state<View>("search");
    let submittedQuery = $state<SearchQuery | null>(null);

    function resolveApiKey(): string | undefined {
        if (!apiKey) return undefined;
        return plugin.app.secretStorage.getSecret(apiKey) ?? undefined;
    }

    const matchingPapers = createQuery(() => ({
        queryKey: ["paperSearch", submittedQuery],
        queryFn: () => {
            return searchPapers(submittedQuery!, resolveApiKey());
        },
        enabled: submittedQuery !== null,
    }));

    function handleSubmit(query: SearchQuery) {
        submittedQuery = query;
        currentView = "results";
    }

    function handleBack() {
        currentView = "search";
    }

    async function handleSelect(paperId: string) {
        await createLiteratureNote(plugin, paperId);
        fetchAndStoreRelations(plugin, paperId);
        close();
    }
</script>

{#if currentView == "search"}
    <SearchForm onsubmit={handleSubmit} onclose={close} />
{:else if currentView == "results"}
    {#if matchingPapers.data}
        <SearchResults
            papers={matchingPapers.data.data ?? []}
            onback={handleBack}
            onclose={close}
            onselect={handleSelect}
        />
    {/if}

    {#if matchingPapers.isFetching}
        <p class="p-2 text-sm text-gray-500">Loading...</p>
    {/if}

    {#if matchingPapers.isError}
        <div class="p-2 text-sm text-red-500">
            {matchingPapers.error.message}
        </div>
    {/if}
{/if}
