<script lang="ts">
    import "./app.css";
    import { route } from "./lib/router.js";
    import UserLoginPage from "./lib/pages/UserLoginPage.svelte";
    import UserRegisterPage from "./lib/pages/UserRegisterPage.svelte";
    import RouteGuard from "./lib/route-guard.svelte";
</script>

<main>
    {#if $route === "/login"}
    <UserLoginPage />
    {:else if $route === "/register"}
    <UserRegisterPage />
    {:else}
    <RouteGuard>
    </RouteGuard>
    {/if}
</main>
