<script lang="ts">
    import type { Paper } from "../../lib/semanticScholarApi";
    import PaperCard from "./PaperCard/PaperCard.svelte";

    interface Props {
        papers: Paper[];
        onback: () => void;
        onselect: (paperId: string) => void;
        onclose: () => void;
    }

    let { papers, onback, onselect, onclose }: Props = $props();
</script>

<div class="flex flex-col gap-2 max-h-[70vh] overflow-scroll scrollbar">
    {#each papers as paper}
        <PaperCard {paper} onselect={() => onselect(paper.paperId)} />
    {/each}
</div>
<div class="modal-button-container">
    <button onclick={onclose}>Cancle</button>
    <button class="mod-cta" onclick={onback}>Back</button>
</div>
