<script lang="ts">
    import { Slider } from "bits-ui";
    import Select from "../../components/Select.svelte";
    import {
        SearchQuerySchema,
        type SearchQuery,
        publicationTypes,
        fieldsOfStudy,
    } from "../../lib/searchQuery";

    interface Props {
        onsubmit: (query: SearchQuery) => void;
        onclose: () => void;
    }

    let { onsubmit, onclose }: Props = $props();

    const currentYear = new Date().getFullYear();

    let searchQuery = $state<SearchQuery>({
        query: "",
        fields: "title,abstract,authors,year,citationCount,url,openAccessPdf",
    });
    let yearRange = $state<[number, number]>([1931, currentYear]);
    let selectedPublicationTypes = $state<string[]>([]);
    let selectedFieldsOfStudy = $state<string[]>([]);

    const publicationTypeItems = publicationTypes.map((pt) => ({
        value: pt,
        label: pt,
    }));
    const fieldsOfStudyItems = fieldsOfStudy.map((f) => ({
        value: f,
        label: f,
    }));

    function buildQuery(): SearchQuery {
        const q: SearchQuery = { ...searchQuery };
        q.query = q.query.trim();
        if (yearRange[0] !== 1931 || yearRange[1] !== currentYear) {
            q.year = `${yearRange[0]}-${yearRange[1]}`;
        }
        if (selectedPublicationTypes.length > 0) {
            q.publicationTypes =
                selectedPublicationTypes as SearchQuery["publicationTypes"];
        }
        if (selectedFieldsOfStudy.length > 0) {
            q.fieldsOfStudy =
                selectedFieldsOfStudy as SearchQuery["fieldsOfStudy"];
        }
        return q;
    }

    function submit() {
        const query = buildQuery();
        const parsed = SearchQuerySchema.parse(query);
        onsubmit(parsed);
    }

    function handleKeyPress(
        event: KeyboardEvent & {
            currentTarget: EventTarget & HTMLInputElement;
        },
    ) {
        if (event.key === "Enter") submit();
    }
</script>

<div class="flex flex-col gap-3 p-2">
    <!-- Search Input -->
    <div class="flex w-full gap-2">
        <input
            class="flex-1 rounded border border-solid border-gray-300 px-3 py-2 text-sm"
            type="text"
            placeholder="Search papers..."
            bind:value={searchQuery.query}
            onkeypress={handleKeyPress}
        />
    </div>

    <div
        class="flex flex-col gap-4 rounded border border-solid border-gray-200 p-3"
    >
        <!-- Year Range Slider -->
        <div class="flex flex-col gap-2">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="text-xs font-medium">
                Publication Year: {yearRange[0]} – {yearRange[1]}
            </label>
            <Slider.Root
                type="multiple"
                bind:value={yearRange}
                min={1931}
                max={currentYear}
                step={1}
                onValueChange={(v) => {
                    if (v[0] <= v[1]) {
                        yearRange = v as [number, number];
                    }
                }}
                class="relative flex w-full touch-none select-none items-center"
            >
                {#snippet children({ tickItems, thumbs })}
                    <span
                        class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-gray-200"
                    >
                        <Slider.Range class="absolute h-full bg-blue-500" />
                    </span>
                    {#each thumbs as index (index)}
                        <Slider.Thumb
                            {index}
                            class="block size-4 cursor-pointer rounded-full border border-solid border-gray-400 bg-white shadow-sm"
                        />
                    {/each}
                    {#each tickItems as { index } (index)}
                        <Slider.Tick
                            {index}
                            class="h-2 w-[1px] bg-gray-400/30"
                        />
                    {/each}
                {/snippet}
            </Slider.Root>
        </div>

        <!-- Publication Types Select -->
        <div class="flex flex-col gap-1">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="text-xs font-medium">Publication Types</label>
            <Select
                type="multiple"
                bind:value={selectedPublicationTypes}
                items={publicationTypeItems}
                placeholder="Any type"
            />
        </div>

        <!-- Fields of Study Select -->
        <div class="flex flex-col gap-1">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="text-xs font-medium">Fields of Study</label>
            <Select
                type="multiple"
                bind:value={selectedFieldsOfStudy}
                items={fieldsOfStudyItems}
                placeholder="Any field"
            />
        </div>

        <!-- Min Citations -->
        <div class="flex flex-col gap-1">
            <label class="text-xs font-medium" for="min-citations">
                Min Citations
            </label>
            <input
                id="min-citations"
                class="w-24 rounded border border-solid border-gray-300 px-2 py-1 text-sm"
                type="number"
                min="0"
                placeholder="0"
                value={searchQuery.minCitationCount ?? ""}
                oninput={(e) => {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    searchQuery.minCitationCount = isNaN(val) ? undefined : val;
                }}
            />
        </div>

        <!-- Open Access PDF -->
        <label class="flex items-center gap-2 text-xs">
            <input
                type="checkbox"
                checked={searchQuery.openAccessPdf ?? false}
                onchange={(e) => {
                    searchQuery.openAccessPdf = (e.target as HTMLInputElement)
                        .checked
                        ? true
                        : undefined;
                }}
            />
            Open Access PDF only
        </label>
    </div>
</div>
<div class="modal-button-container">
    <button onclick={onclose}>Cancle</button>
    <button
        class="mod-cta"
        onclick={submit}
        disabled={searchQuery.query.trim().length < 2}
    >
        Search
    </button>
</div>
