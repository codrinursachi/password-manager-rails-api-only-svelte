<script lang="ts">
    import TableContentSkeleton from "../skeletons/table-content-skeleton.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import { useQuery } from "@sveltestack/svelte-query";
    import { queryTrashedLogins } from "$lib/util/query-utils/query-trashed-logins";
    import { toast } from "svelte-sonner";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { navigate } from "$lib/router";
    import TrashedLoginDropdown from "./trashed-login-dropdown.svelte";

    type TrashedLogin = {
        login_id: number;
        name: string;
        urls: string[];
        trash_date: string;
    };

    const trashedLoginsQuery = useQuery<{ trashedLogins: TrashedLogin[] }>(
        ["trashedLogins"],
        ({ signal }) => queryTrashedLogins(signal)
    );
    $effect(() => {
        if ($trashedLoginsQuery.error) {
            toast.error(
                $trashedLoginsQuery.error instanceof Error
                    ? $trashedLoginsQuery.error.message
                    : "Failed to load trashed logins.",
                {
                    description: "Failed to load trashed logins.",
                    action: {
                        label: "Retry",
                        onClick: () =>
                            queryClient.invalidateQueries({
                                queryKey: ["trashedLogins"],
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
            <Table.Head>URL</Table.Head>
            <Table.Head>Trash date</Table.Head>
            <Table.Head class="w-16">Actions</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#if $trashedLoginsQuery.isFetching}
            <TableContentSkeleton cellNumber={4} />
        {:else}
            {#each $trashedLoginsQuery.data?.trashedLogins ?? [] as login (login.login_id)}
                <Table.Row>
                    <Table.Cell>
                        <button
                            onclick={() => {
                                navigate("/trash/" + login.login_id);
                            }}
                            class="w-full text-left">{login.name}</button
                        >
                    </Table.Cell>
                    <Table.Cell>
                        <a
                            href={(login.urls[0].includes("http") &&
                                login.urls[0]) ||
                                "//" + login.urls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div class="w-full">{login.urls[0]}</div>
                        </a>
                    </Table.Cell>
                    <Table.Cell>{login.trash_date}</Table.Cell>
                    <Table.Cell>
                        <TrashedLoginDropdown {login} />
                    </Table.Cell>
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
</Table.Root>
