<script lang="ts">
    import "./app.css";
    import { route } from "./lib/router.js";
    import UserLoginPage from "./lib/pages/UserLoginPage.svelte";
    import UserRegisterPage from "./lib/pages/UserRegisterPage.svelte";
    import RouteGuard from "./lib/route-guard.svelte";
    import MainApp from "./lib/pages/MainApp.svelte";
    import { QueryClientProvider } from "@sveltestack/svelte-query";
    import { queryClient } from "./lib/util/query-utils/query-client.js";
</script>

<QueryClientProvider client={queryClient}>
    {#if $route === "/login"}
        <UserLoginPage />
    {:else if $route === "/register"}
        <UserRegisterPage />
    {:else}
        <RouteGuard>
            <MainApp />
        </RouteGuard>
    {/if}
</QueryClientProvider>
