<script lang="ts">
    import type { Author } from "../../../lib/semanticScholarApi";

    interface Props {
        authors: Author[] | string[];
        maxAuthors?: number;
    }

    let { authors, maxAuthors = 3 }: Props = $props();

    let expanded = $state(false);

    function getAuthorName(author: Author | string): string {
        return typeof author === "string" ? author : author.name;
    }
</script>

{#if authors.length}
    <div class="flex flex-row flex-wrap gap-1">
        {#each authors.slice(0, expanded ? authors.length : maxAuthors) as author}
            <div
                class="text-xs bg-white w-fit whitespace-nowrap px-1 rounded-sm border-[--background-modifier-border]"
            >
                {getAuthorName(author)}
            </div>
        {/each}
        {#if authors.length > maxAuthors}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="text-xs bg-white w-fit whitespace-nowrap px-1 rounded-sm border-[--background-modifier-border] cursor-pointer"
                onclick={() => {
                    expanded = !expanded;
                }}
            >
                {expanded
                    ? "- show less"
                    : `+${authors.length - maxAuthors} authors`}
            </div>
        {/if}
    </div>
{/if}
