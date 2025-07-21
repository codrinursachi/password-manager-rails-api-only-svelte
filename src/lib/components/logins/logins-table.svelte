<script lang="ts">
    import * as Table from "$lib/components/ui/table/index.js";
    import { navigate, route } from "$lib/router";
    import { mutateLogin } from "$lib/util/mutate-utils/mutate-login";
    import { mutateSharedLogin } from "$lib/util/mutate-utils/mutate-shared-login";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { queryLogins } from "$lib/util/query-utils/query-logins";
    import { useMutation, useQuery } from "@sveltestack/svelte-query";
    import { toast } from "svelte-sonner";
    import TableContentSkeleton from "../skeletons/table-content-skeleton.svelte";
    import LoginDropdown from "./login-dropdown.svelte";
    import { untrack } from "svelte";

    type Login = {
        login_id: number;
        name: string;
        login_name: string;
        urls: string[];
        login_password: string;
        iv: string;
    };

    const searchParams = $derived(
        new URLSearchParams($route.split("?")[1] || "")
    );
    const loginsQuery = useQuery<{ logins: Login[] }>(
        ["logins", () => searchParams.toString() || ""],
        ({ signal }) => queryLogins(searchParams.toString() || "", signal)
    );
    const loginMutation = useMutation(
        ["login", "trash"],
        async (loginId: string) => {
            await mutateLogin(null, loginId, "DELETE");
        },
        {
            onError: (error: Error, variables) => {
                console.error(error);
                toast.error(error.message, {
                    description: "Error sending login to trash",
                    action: {
                        label: "Try again",
                        onClick: () => $loginMutation.mutate(variables),
                    },
                });
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ["logins", ""] });
            },
        }
    );
    const sharedLoginMutation = useMutation(
        ["sharedLogins", "add"],
        async ({
            formData,
            loginId,
        }: {
            formData: FormData;
            loginId: string;
        }) => {
            navigate("/shared-logins/by-me");
            await mutateSharedLogin(formData, loginId);
        },
        {
            onError: (error: Error, variables) => {
                toast.error(error.message, {
                    description: "Error sharing login",
                    action: {
                        label: "Try again",
                        onClick: () => $sharedLoginMutation.mutate(variables),
                    },
                });
            },
            onSettled: () => {
                queryClient.invalidateQueries({
                    queryKey: ["shared-logins", "by_me=true"],
                });
            },
        }
    );
    $effect(() => {
        $route;
        untrack(() => {
            loginsQuery.setOptions(
                ["logins", searchParams.toString() || ""],
                ({ signal }) =>
                    queryLogins(searchParams.toString() || "", signal)
            );
            $loginsQuery.refetch();
        });
    });
    $effect(() => {
        if ($loginsQuery.error) {
            toast.error(
                $loginsQuery.error instanceof Error
                    ? $loginsQuery.error.message
                    : "Unknown error",
                {
                    description: "Failed to load logins.",
                    action: {
                        label: "Retry",
                        onClick: () =>
                            queryClient.invalidateQueries({
                                queryKey: [
                                    "logins",
                                    searchParams?.toString() ?? "",
                                ],
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
            <Table.Head class="w-16">Actions</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#if !$loginsQuery.data?.logins}
            <TableContentSkeleton cellNumber={4} />
        {:else}
            {#each $loginsQuery.data?.logins as login (login.login_id)}
                <Table.Row>
                    <Table.Cell>
                        <button
                            onclick={() =>
                                navigate("/logins/" + login.login_id + "/edit")}
                            class="w-full text-left"
                        >
                            <div class="w-full">{login.name}</div>
                        </button>
                    </Table.Cell>
                    <Table.Cell>{login.login_name}</Table.Cell>
                    <Table.Cell>
                        <a
                            href={(login.urls[0].includes("http") &&
                                login.urls[0]) ||
                                "//" + login.urls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div class="w-full">
                                {login.urls[0]}
                            </div>
                        </a>
                    </Table.Cell>
                    <Table.Cell>
                        {#if login.login_id}
                            <LoginDropdown
                                {login}
                                {loginMutation}
                                {sharedLoginMutation}
                            />
                        {/if}
                    </Table.Cell>
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
</Table.Root>
