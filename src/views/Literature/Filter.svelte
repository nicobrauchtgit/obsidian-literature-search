<script lang="ts">
    import type { StoredPaper } from "../../lib/db";
    import { DropdownMenu } from "bits-ui";
    import { icon } from "../../lib/icon";
    import Fuse from "fuse.js";

    type SortOption = "newest" | "most-cited";

    interface Props {
        papers: StoredPaper[];
        filteredPapers: StoredPaper[];
        paperId: string;
    }

    let { papers, filteredPapers = $bindable(), paperId }: Props = $props();

    let filterString = $state("");
    let onlyInfluential = $state(false);
    let sortBy = $state<SortOption>("newest");

    const sortLabels: Record<SortOption, string> = {
        newest: "Newest",
        "most-cited": "Most cited",
    };

    const fuse = $derived(
        new Fuse(papers, {
            keys: ["title", "authors"],
            threshold: 0.4,
        }),
    );

    function sortPapers(papers: StoredPaper[]): StoredPaper[] {
        return [...papers].sort((a, b) => {
            if (sortBy === "newest") {
                return (b.year ?? 0) - (a.year ?? 0);
            }
            return b.citationCount - a.citationCount;
        });
    }

    const filtered = $derived.by(() => {
        let result =
            filterString === ""
                ? papers
                : fuse.search(filterString).map((r) => r.item);

        if (onlyInfluential) {
            result = result.filter((p) => p.influentialFor?.includes(paperId));
        }

        return sortPapers(result);
    });

    $effect(() => {
        filteredPapers = filtered;
    });
</script>

<div class="flex flex-col gap-2">
    <div class="flex w-full gap-2">
        <input
            class="flex-1 rounded border border-solid border-gray-300 px-3 py-2 text-sm"
            type="text"
            placeholder="Filter..."
            bind:value={filterString}
        />
        <button
            class="text-xs px-2 py-1 rounded-sm cursor-pointer border border-solid transition-colors
                {onlyInfluential
                ? 'bg-[--interactive-accent] text-[--text-on-accent] border-[--interactive-accent]'
                : 'bg-transparent text-[--text-normal] border-[--background-modifier-border] hover:bg-[--interactive-hover]'}"
            onclick={() => (onlyInfluential = !onlyInfluential)}
        >
            Influential
        </button>

        <!-- Sort dropdown -->
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="items-center place-items-center">
                <span use:icon={"arrow-up-down"} style="--icon-size: 12px;">
                </span></DropdownMenu.Trigger
            >
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    class="border border-solid border-[--background-modifier-border] bg-[--background-primary] rounded-md p-1 shadow-md z-50"
                    sideOffset={4}
                >
                    <DropdownMenu.RadioGroup bind:value={sortBy}>
                        <DropdownMenu.RadioItem
                            value="newest"
                            class="text-xs px-3 py-1.5 rounded-sm cursor-pointer text-[--text-normal] data-[highlighted]:bg-[--interactive-hover] outline-none"
                        >
                            {#snippet children({ checked })}
                                <span class="inline-flex items-center gap-2">
                                    {#if checked}
                                        <span
                                            use:icon={"check"}
                                            style="--icon-size: 12px;"
                                        ></span>
                                    {:else}
                                        <span class="w-3"></span>
                                    {/if}
                                    Newest
                                </span>
                            {/snippet}
                        </DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem
                            value="most-cited"
                            class="text-xs px-3 py-1.5 rounded-sm cursor-pointer text-[--text-normal] data-[highlighted]:bg-[--interactive-hover] outline-none"
                        >
                            {#snippet children({ checked })}
                                <span class="inline-flex items-center gap-2">
                                    {#if checked}
                                        <span
                                            use:icon={"check"}
                                            style="--icon-size: 12px;"
                                        ></span>
                                    {:else}
                                        <span class="w-3"></span>
                                    {/if}
                                    Most cited
                                </span>
                            {/snippet}
                        </DropdownMenu.RadioItem>
                    </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    </div>
</div>
