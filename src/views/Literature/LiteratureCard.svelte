<script lang="ts">
    import type { StoredPaper } from "../../lib/db";
    import PaperAuthors from "../PaperSearch/PaperCard/PaperAuthors.svelte";
    import { icon } from "../../lib/icon";

    interface Props {
        paper: StoredPaper;
        maxAuthors?: number;
        isInfluential?: boolean;
        hasNote?: boolean;
    }

    let {
        paper,
        maxAuthors = 2,
        isInfluential = false,
        hasNote = false,
    }: Props = $props();

    let textExpanded = $state(false);

    let description = $derived(paper.tldr ?? paper.abstract ?? null);

    let pdfLink = $derived(
        paper.openAccessPdf ??
            (paper.arxivId ? `https://arxiv.org/pdf/${paper.arxivId}` : null) ??
            paper.doi,
    );
</script>

<div
    class="flex flex-col [&_*]:!m-0 gap-2 border border-1 rounded-md border-solid border-[--background-modifier-border] p-2"
>
    <!-- Tags -->
    {#if isInfluential || hasNote}
        <div class="flex flex-row gap-1">
            {#if isInfluential}
                <span
                    class="text-[10px] px-1.5 py-0.5 rounded-sm bg-[--text-accent] text-[--text-on-accent] font-medium"
                >
                    influential
                </span>
            {/if}
            {#if hasNote}
                <span
                    class="text-[10px] px-1.5 py-0.5 rounded-sm bg-[--background-modifier-success] text-[--text-on-accent] font-medium inline-flex items-center gap-0.5"
                >
                    <span use:icon={"file-text"} style="--icon-size: 10px;"
                    ></span>
                    in vault
                </span>
            {/if}
        </div>
    {/if}

    <!-- Title -->
    <h4 class="text-sm font-medium text-accent">{paper.title}</h4>

    <!-- Authors -->
    <PaperAuthors authors={paper.authors} {maxAuthors} />

    <!-- Description (tldr > abstract > nothing) -->
    {#if description}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="relative text-xs text-[--text-muted] leading-[1.4] cursor-pointer"
            onclick={() => {
                textExpanded = !textExpanded;
            }}
        >
            <div
                class="overflow-hidden"
                style={textExpanded ? "" : "max-height: 4.2em;"}
            >
                {description}
            </div>
            {#if !textExpanded}
                <span
                    class="absolute bottom-0 right-0 text-[--text-accent] hover:underline"
                    style="background: linear-gradient(to right, transparent, var(--background-secondary) 20%);
                           padding-left: 1.5em;">show more</span
                >
            {:else}
                <span class="text-[--text-accent] hover:underline">
                    show less
                </span>
            {/if}
        </div>
    {/if}

    <!-- Meta row -->
    <div
        class="flex flex-row flex-wrap gap-1 text-xs text-[--text-muted] items-center"
    >
        {#if paper.year}
            <span
                class="px-1 rounded-sm bg-[--background-secondary] border border-solid border-[--background-modifier-border]"
                >{paper.year}</span
            >
        {/if}
        <span
            class="px-1 rounded-sm bg-[--background-secondary] border border-solid border-[--background-modifier-border] inline-flex items-center gap-0.5"
        >
            <span
                use:icon={"quote"}
                class="flex items-center"
                style="--icon-size: 12px;"
            ></span>
            {paper.citationCount}
        </span>
        <span
            class="px-1 rounded-sm bg-[--background-secondary] border border-solid border-[--background-modifier-border] inline-flex items-center gap-0.5"
        >
            <span
                use:icon={"star"}
                class="flex items-center"
                style="--icon-size: 12px;"
            ></span>
            {paper.influentialCitationCount}
        </span>
    </div>

    <!-- Action buttons -->
    <div class="flex flex-row gap-1">
        <button
            class="text-xs px-2 py-1 rounded-sm bg-[--interactive-accent] text-[--text-on-accent] cursor-pointer border-none hover:opacity-90"
            onclick={() => window.open(paper.url)}
        >
            Semantic Scholar
        </button>
        {#if pdfLink}
            <button
                class="text-xs px-2 py-1 rounded-sm bg-[--interactive-accent] text-[--text-on-accent] cursor-pointer border-none hover:opacity-90"
                onclick={() => window.open(pdfLink!)}
            >
                PDF
            </button>
        {/if}
    </div>
</div>
