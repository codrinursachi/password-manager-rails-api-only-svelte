<script lang="ts">
    import LoginDialog from "$lib/components/logins/login-dialog.svelte";
    import LoginSearchForm from "$lib/components/logins/login-search-form.svelte";
    import LoginsTable from "$lib/components/logins/logins-table.svelte";
    import { Button } from "$lib/components/ui/button";
    import { navigate } from "$lib/router";
</script>

<div class="flex flex-col gap-4">
    <h1>Logins</h1>
    <LoginSearchForm />
    <Button
        variant="outline"
        class="w-46"
        onclick={() => {
            navigate("/logins/new");
        }}
    >
        Create login
    </Button>
    <LoginDialog />
    <LoginsTable />
</div>
