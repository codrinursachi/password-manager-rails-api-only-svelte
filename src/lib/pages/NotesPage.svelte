<script lang="ts">
    import NotesDialog from "$lib/components/notes/notes-dialog.svelte";
    import NotesTable from "$lib/components/notes/notes-table.svelte";
    import { Button } from "$lib/components/ui/button";
    import { navigate } from "$lib/router";
</script>

<div class="flex flex-col gap-4">
    <h1>Notes</h1>
    <Button
        onclick={() => {
            navigate("/notes/new");
        }}
        variant="outline"
        class="w-46">Create note</Button
    >
    <div class="flex flex-wrap gap-4">
        <NotesTable />
    </div>
    <NotesDialog />
</div>
