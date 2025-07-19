<script lang="ts">
    import { Skeleton } from "../ui/skeleton";
</script>

{#each [...Array(8)] as _element, index (index)}
    <Skeleton class="w-full h-8" />
{/each}
