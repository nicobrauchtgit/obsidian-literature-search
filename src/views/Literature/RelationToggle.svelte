<script lang="ts">
    interface Props {
        activeTab: "references" | "citations";
    }

    let { activeTab = $bindable() }: Props = $props();
</script>

<div class="flex flex-row gap-1">
    <button
        class="flex-1 text-sm px-2 py-1 rounded-sm cursor-pointer border border-solid transition-colors
                {activeTab === 'references'
            ? 'bg-[--interactive-accent] text-[--text-on-accent] border-[--interactive-accent]'
            : 'bg-transparent text-[--text-normal] border-[--background-modifier-border] hover:bg-[--interactive-hover]'}"
        onclick={() => {
            activeTab = "references";
        }}
    >
        References
    </button>
    <button
        class="flex-1 text-sm px-2 py-1 rounded-sm cursor-pointer border border-solid transition-colors
                {activeTab === 'citations'
            ? 'bg-[--interactive-accent] text-[--text-on-accent] border-[--interactive-accent]'
            : 'bg-transparent text-[--text-normal] border-[--background-modifier-border] hover:bg-[--interactive-hover]'}"
        onclick={() => {
            activeTab = "citations";
        }}
    >
        Citations
    </button>
</div>
