<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { navigate, route } from "$lib/router";
    import { queryFolders } from "$lib/util/query-utils/query-folders";
    import FoldersDropdown from "./folders-dropdown.svelte";
    import SidebarUserFoldersGroupLabel from "./sidebar-user-folders-group-label.svelte";

    const params = new URLSearchParams(new URL(window.location.href).search);
    const currentFolder = params.get("folder_id");
    let data = $state([]);
    $effect(() => {
        const fetchFolders = async () => {
            try {
                data = await queryFolders(null);
            } catch (error) {
                console.error("Error fetching folders:", error);
                data = [];
            }
        };

        fetchFolders();
    });
</script>

<Sidebar.Group>
    <SidebarUserFoldersGroupLabel />
    <Sidebar.GroupContent>
        <Sidebar.Menu>
            {#if !data}
                <!-- <UserFoldersSkeleton /> -->
            {:else}
                {#each data as folder (folder.id)}
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
