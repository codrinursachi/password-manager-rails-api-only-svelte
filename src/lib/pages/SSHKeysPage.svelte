<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { navigate } from "$lib/router";
    import SSHKeyDialog from "$lib/components/ssh-keys/ssh-key-dialog.svelte";
    import SSHKeysTable from "$lib/components/ssh-keys/ssh-keys-table.svelte";
</script>

<div class="flex flex-col gap-4">
    <h1>SSH Keys</h1>
    <Button
        onclick={() => {
            navigate("/ssh-keys/new");
        }}
        variant="outline"
        class="w-46"
    >
        Add SSH key
    </Button>
    <div class="flex flex-wrap gap-4">
        <SSHKeysTable />
    </div>
    <SSHKeyDialog />
</div>
