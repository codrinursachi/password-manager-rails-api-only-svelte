<script lang="ts">
    import * as Table from "$lib/components/ui/table/index.js";
    import { Skeleton } from "../ui/skeleton";
    const { cellNumber } = $props();
</script>

{#each [...Array(8)] as _element, rowIndex (rowIndex)}
    <Table.Row>
        {#each [...Array(cellNumber)] as _element, cellIndex (cellIndex)}
            <Table.Cell>
                <Skeleton class="w-full h-8" />
            </Table.Cell>
        {/each}
    </Table.Row>
{/each}
