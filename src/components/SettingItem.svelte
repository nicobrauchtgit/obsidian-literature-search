<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        name: string;
        desc: string;
        class?: string;
        children?: Snippet;
    }

    let { name, desc, class: className = "", children }: Props = $props();
</script>

<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item">
            <span>{name}</span>
        </div>
        {#if desc}
            <div class="setting-item-description">{desc}</div>
        {/if}
    </div>
    <div class="setting-item-control">
        {@render children?.()}
    </div>
</div>
