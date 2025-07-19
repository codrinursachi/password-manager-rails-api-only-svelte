<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { navigate, route } from "$lib/router";
    import { queryFolders } from "$lib/util/query-utils/query-folders";
    import { useQuery } from "@sveltestack/svelte-query";
    import FoldersDropdown from "./folders-dropdown.svelte";
    import SidebarUserFoldersGroupLabel from "./sidebar-user-folders-group-label.svelte";
    import UserFoldersSkeleton from "../skeletons/user-folders-skeleton.svelte";

    const params = new URLSearchParams(new URL(window.location.href).search);
    const currentFolder = params.get("folder_id");
    const folders = useQuery("folders", async () => await queryFolders(null), {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
</script>

<Sidebar.Group>
    <SidebarUserFoldersGroupLabel />
    <Sidebar.GroupContent>
        <Sidebar.Menu>
            {#if !$folders.data}
                <UserFoldersSkeleton />
            {:else}
                {#each $folders.data as folder (folder.id)}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton
                            isActive={currentFolder === folder.id.toString()}
                        >
                            {#snippet child({ props })}
                                <button
                                    onclick={() =>
                                        navigate(
                                            "/logins?folder_id=" + folder.id
                                        )}
                                    {...props}
                                >
                                    <span>{folder.name}</span>
                                </button>
                            {/snippet}
                        </Sidebar.MenuButton>
                        {#if folder.name !== "No folder"}
                            <FoldersDropdown {folder} />
                        {/if}
                    </Sidebar.MenuItem>
                {/each}
            {/if}
        </Sidebar.Menu>
    </Sidebar.GroupContent>
</Sidebar.Group>
