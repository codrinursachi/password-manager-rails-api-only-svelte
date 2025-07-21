<script lang="ts">
    import TableContentSkeleton from "../skeletons/table-content-skeleton.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import { navigate, route } from "$lib/router";
    import { useQuery } from "@sveltestack/svelte-query";
    import { querySharedLogins } from "$lib/util/query-utils/query-shared-logins";
    import { toast } from "svelte-sonner";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import SharedLoginDropdown from "./shared-login-dropdown.svelte";

    const queryParameter = $derived(
        $route.includes("by-me") ? "by_me=true" : ""
    );
    const sharedLoginsQuery = useQuery(
        // svelte-ignore state_referenced_locally
        ["sharedLogins", queryParameter],
        ({ signal }) => querySharedLogins(queryParameter, signal)
    );
    $effect(() => {
        if ($sharedLoginsQuery.error) {
            toast.error(
                $sharedLoginsQuery.error instanceof Error
                    ? $sharedLoginsQuery.error.message
                    : "Unknown error",
                {
                    description: "Failed to load shared logins.",
                    action: {
                        label: "Retry",
                        onClick: () =>
                            queryClient.invalidateQueries({
                                queryKey: ["sharedLogins"],
                            }),
                    },
                }
            );
        }
    });
</script>

<Table.Root class="table-fixed">
    <Table.Header>
        <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Username</Table.Head>
            <Table.Head>URL</Table.Head>
            {#if queryParameter}
                <Table.Head>Shared with</Table.Head>
            {:else}
                <Table.Head>Shared by</Table.Head>
            {/if}
            <Table.Head class="w-16">Actions</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#if $sharedLoginsQuery.isFetching}
            <TableContentSkeleton cellNumber={5} />
        {:else}
            {#each $sharedLoginsQuery.data?.sharedLogins as login, index (index)}
                <Table.Row>
                    <Table.Cell>
                        <button
                            onclick={() => {
                                navigate(
                                    "/shared-logins/" +
                                        (queryParameter
                                            ? "by-me/"
                                            : "with-me/") +
                                        login.login_id
                                );
                            }}
                            class="w-full text-left"
                        >
                            {login.name}
                        </button>
                    </Table.Cell>
                    <Table.Cell>{login.login_name}</Table.Cell>
                    <Table.Cell>
                        <a
                            href={"//" + login.urls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-full"
                        >
                            {login.urls[0]}
                        </a>
                    </Table.Cell>
                    <Table.Cell>
                        {#if queryParameter}
                            <div class="w-full">
                                {login.shared_with}
                            </div>
                        {:else}
                            <div class="w-full">
                                {login.shared_by}
                            </div>
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        <SharedLoginDropdown {login} />
                    </Table.Cell>
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
</Table.Root>
