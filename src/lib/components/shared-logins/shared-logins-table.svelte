<script lang="ts">
    import TableContentSkeleton from "../skeletons/table-content-skeleton.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import { navigate, route } from "$lib/router";
    import { querySharedLogins } from "$lib/util/query-utils/query-shared-logins";
    import { toast } from "svelte-sonner";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import SharedLoginDropdown from "./shared-login-dropdown.svelte";
    import { createQuery, useMutationState } from "@tanstack/svelte-query";

    const queryParameter = $derived(
        $route.includes("by-me") ? "by_me=true" : ""
    );
    const sharedLoginsQuery = createQuery({
        // svelte-ignore state_referenced_locally
        queryKey: ["sharedLogins", queryParameter],
        queryFn: ({ signal }) => querySharedLogins(queryParameter, signal),
    });

    const pendingSharedLoginsAdd = useMutationState({
        filters: { mutationKey: ["sharedLogins", "add"], status: "pending" },
        select: (mutation) => {
            const formdata = (
                mutation.state.variables as { formData: FormData }
            ).formData;
            return {
                name: formdata.get("shared_login_datum[name]")!.toString(),
                login_name: formdata
                    .get("shared_login_datum[login_name]")!
                    .toString(),
                url: formdata
                    .get("shared_login_datum[urls_attributes][0][uri]")!
                    .toString(),
                shared_with: formdata
                    .get("shared_login_datum[email]")
                    ?.toString(),
            };
        },
    });
    const pendingSharedLoginsDelete = useMutationState({
        filters: { mutationKey: ["sharedLogins", "delete"], status: "pending" },
        select: (mutation) => mutation.state.variables,
    });

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
                {@const pendingDelete = $pendingSharedLoginsDelete.find(
                    (loginId) => loginId === login.id.toString()
                )}
                <Table.Row class={pendingDelete ? "text-red-500" : ""}>
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
            {#each $pendingSharedLoginsAdd as login, index (index)}
                <Table.Row class="text-gray-500">
                    <Table.Cell>
                        <div class="w-full">{login.name}</div>
                    </Table.Cell>
                    <Table.Cell>{login.login_name}</Table.Cell>
                    <Table.Cell>
                        <div class="w-full">{login.url}</div>
                    </Table.Cell>
                    <Table.Cell>{login.shared_with}</Table.Cell>
                    <Table.Cell></Table.Cell>
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
</Table.Root>
