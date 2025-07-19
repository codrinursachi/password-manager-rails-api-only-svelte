<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Toaster } from "svelte-sonner";
    import AppSidebar from "./AppSidebar.svelte";
    import { route } from "$lib/router";
    import LoginsPage from "./LoginsPage.svelte";
</script>

<Sidebar.Provider>
    <AppSidebar />
    <main class="p-4">
        {#if $route.startsWith("/logins")}
            <LoginsPage />
        {/if}
    </main>
    <Toaster closeButton />
</Sidebar.Provider>
