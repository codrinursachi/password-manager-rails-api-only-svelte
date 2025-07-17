<script lang="ts">
    import { navigate, route } from "$lib/router";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";

    const { children } = $props();
    const specialLocations = [
        ["All logins", "/logins"],
        ["Favorites", "/logins?favorite=true"],
        ["Shared by me", "/shared-logins/by-me"],
        ["Shared with me", "/shared-logins/with-me"],
        ["Notes", "/notes"],
        ["SSH Keys", "/ssh-keys"],
    ];
    const currentUrl = $derived($route);
</script>

<Sidebar.Group>
    <Sidebar.GroupContent>
        <Sidebar.Menu>
            {#each specialLocations as [name, path] (path)}
                <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive={currentUrl === path}>
                        {#snippet child({ props })}
                            <button onclick={() => navigate(path)} {...props}>
                                <span>{name}</span>
                            </button>
                        {/snippet}
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            {/each}
        </Sidebar.Menu>
    </Sidebar.GroupContent>
</Sidebar.Group>
{@render children()}
<Sidebar.Group>
    <Sidebar.GroupContent>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton isActive={currentUrl === "/trash"}>
                    {#snippet child({ props })}
                        <button onclick={() => navigate("/trash")} {...props}>
                            <span>Trash</span>
                        </button>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.GroupContent>
</Sidebar.Group>
