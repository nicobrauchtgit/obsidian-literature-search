<script lang="ts">
    import type { S2FieldOfStudy } from "../../../lib/semanticScholarApi";

    interface Props {
        s2FieldsOfStudy?: S2FieldOfStudy[];
        fieldsOfStudy?: string[] | null;
        year?: number;
        citationCount?: number | null;
        tldr?: string;
    }

    let { s2FieldsOfStudy, fieldsOfStudy, year, citationCount, tldr }: Props =
        $props();
</script>

<div class="mt-1 flex flex-col gap-1 text-xs text-gray-400">
    <div class="flex flex-row gap-3 text-xs text-gray-400">
        {#if s2FieldsOfStudy?.length}
            <span>{s2FieldsOfStudy.map((f) => f.category).join(", ")}</span>
        {/if}
        {#if year}
            <span>{year}</span>
        {/if}
    </div>
    {#if tldr}
        <span>{tldr}</span>
    {/if}
    {#if citationCount != null}
        <span>{citationCount} citations</span>
    {/if}
</div>
