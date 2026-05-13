<script lang="ts">
    import type { Paper } from "../../../lib/semanticScholarApi";
    import PaperAuthors from "./PaperAuthors.svelte";
    import PaperMeta from "./PaperMeta.svelte";

    interface Props {
        paper: Paper;
        onselect: () => void;
    }

    let { paper, onselect }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="cursor-pointer flex flex-col [&_*]:!m-0 gap-2 border border-1 rounded-md border-solid border-[--background-modifier-border] hover:border-[--background-modifier-border-hover] hover:bg-[--interactive-hover] p-2"
    onclick={onselect}
>
    <h4 class="text-sm font-medium text-accent">{paper.title}</h4>
    {#if paper.authors}
        <PaperAuthors authors={paper.authors} />
    {/if}
    <PaperMeta
        s2FieldsOfStudy={paper.s2FieldsOfStudy}
        fieldsOfStudy={paper.fieldsOfStudy}
        year={paper.year}
        citationCount={paper.citationCount}
        tldr={paper.tldr?.text}
    />
</div>
