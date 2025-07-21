<script lang="ts">
    import LoginDialog from "$lib/components/logins/login-dialog.svelte";
    import SharedLoginsTable from "$lib/components/shared-logins/shared-logins-table.svelte";

</script>

<div class="flex flex-col gap-4">
    <h1>Shared Logins</h1>
    <LoginDialog />
    <SharedLoginsTable />
</div>
