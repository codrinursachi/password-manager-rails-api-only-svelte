<script lang="ts">
    import { navigate, route } from "./router";
    import { getAuthToken } from "./util/auth";

    let authorized = $state(false);
    let { children } = $props();
    $effect(() => {
        const token = getAuthToken();
        if (!token || token === "EXPIRED") {
            navigate("/login");
            authorized = false;
        } else {
            authorized = true;
            const handleBeforeUnload = () => {
                localStorage.clear();
            };
            addEventListener("beforeunload", handleBeforeUnload);
            setTimeout(
                () => {
                    localStorage.clear();
                    navigate("/login");
                },
                new Date(localStorage.getItem("expiration") || "").getTime() -
                    Date.now()
            );
            navigate("/logins")
            return () => {
                removeEventListener("beforeunload", handleBeforeUnload);
            };
        }
    });
</script>

{#if authorized}
{@render children()}
{/if}
