<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        name?: string;
        children: Snippet;
    }

    let { name, children }: Props = $props();
</script>

<div class="setting-group">
    {#if name}
        <div class="setting-item setting-item-heading">
            <div class="setting-item-name">{name}</div>
            <div class="setting-item-control"></div>
        </div>
    {/if}
    <div class="setting-items">{@render children()}</div>
</div>
