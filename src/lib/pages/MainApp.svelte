<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Toaster } from "svelte-sonner";
    import AppSidebar from "./AppSidebar.svelte";
</script>

<Sidebar.Provider>
    <AppSidebar />
    <main class="p-4"></main>
    <Toaster closeButton />
</Sidebar.Provider>
