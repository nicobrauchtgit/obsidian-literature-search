<script lang="ts">
    import { Select } from "bits-ui";

    type SelectItem = { value: string; label: string; disabled?: boolean };

    type BaseProps = {
        items: SelectItem[];
        placeholder?: string;
    };

    type SingleProps = BaseProps & {
        type: "single";
        value: string;
        onchange?: (value: string) => void;
    };

    type MultipleProps = BaseProps & {
        type: "multiple";
        value: string[];
        onchange?: (value: string[]) => void;
    };

    type Props = SingleProps | MultipleProps;

    let {
        value = $bindable(),
        items,
        placeholder = "Select...",
        type,
        onchange,
    }: Props = $props();
</script>

<Select.Root
    {type}
    bind:value={value as never}
    {items}
    onValueChange={onchange as any}
>
    <Select.Trigger
        class="flex w-full items-center justify-between rounded border border-solid border-gray-300 px-3 py-2 text-sm"
    >
        <Select.Value {placeholder} />
    </Select.Trigger>
    <Select.Portal>
        <Select.Content
            class="z-50 max-h-60 overflow-auto rounded border border-solid border-gray-200 bg-white p-1 shadow-lg"
            sideOffset={4}
        >
            <Select.Viewport>
                {#each items as item (item.value)}
                    <Select.Item
                        class="cursor-pointer rounded px-3 py-1.5 text-sm data-[highlighted]:bg-blue-50"
                        value={item.value}
                        label={item.label}
                        disabled={item.disabled}
                    >
                        {#snippet children({ selected })}
                            <span class="flex items-center gap-2">
                                {#if selected}✓{/if}
                                {item.label}
                            </span>
                        {/snippet}
                    </Select.Item>
                {/each}
            </Select.Viewport>
        </Select.Content>
    </Select.Portal>
</Select.Root>
