<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Toaster } from "svelte-sonner";
    import AppSidebar from "./AppSidebar.svelte";
    import { route } from "$lib/router";
    import LoginsPage from "./LoginsPage.svelte";
    import NotesPage from "./NotesPage.svelte";
    import SSHKeysPage from "./SSHKeysPage.svelte";
    import TrashPage from "./TrashPage.svelte";
</script>

<Sidebar.Provider>
    <AppSidebar />
    <main class="p-4">
        {#if $route.startsWith("/logins")}
            <LoginsPage />
        {:else if $route.startsWith("/notes")}
            <NotesPage />
        {:else if $route.startsWith("/ssh-keys")}
            <SSHKeysPage />
        {:else if $route.startsWith("/trash")}
            <TrashPage />
        {/if}
    </main>
    <Toaster closeButton />
</Sidebar.Provider>
