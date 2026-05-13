<script lang="ts" generics="T extends Record<string, any>">
    import { QueryClientProvider } from "@tanstack/svelte-query";
    import type { Component } from "svelte";
    import type LiteratureSearchPlugin from "../main";

    type Props = {
        plugin: LiteratureSearchPlugin;
        component: Component<T>;
        componentProps: T;
    };

    let { plugin, component, componentProps }: Props = $props();
</script>

<QueryClientProvider client={plugin.queryClient}>
    {@const Component = component}
    <Component {...componentProps} />
</QueryClientProvider>
