<script lang="ts">
    import * as Table from "$lib/components/ui/table/index.js";
    import { navigate, route } from "$lib/router";
    import { mutateLogin } from "$lib/util/mutate-utils/mutate-login";
    import { mutateSharedLogin } from "$lib/util/mutate-utils/mutate-shared-login";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { queryLogins } from "$lib/util/query-utils/query-logins";
    import { toast } from "svelte-sonner";
    import TableContentSkeleton from "../skeletons/table-content-skeleton.svelte";
    import LoginDropdown from "./login-dropdown.svelte";
    import { untrack } from "svelte";
    import {
        createMutation,
        createQuery,
        useMutationState,
    } from "@tanstack/svelte-query";

    type Login = {
        login_id: number;
        name: string;
        login_name: string;
        urls: string[];
        login_password: string;
        iv: string;
    };

    const transformToLogin = (individualFormData: FormData): Login => ({
        login_id: parseInt(
            individualFormData.get("login[login_id]")?.toString() ?? "0"
        ),
        name: individualFormData.get("login[name]")!.toString(),
        login_name: individualFormData.get("login[login_name]")!.toString(),
        urls: [
            individualFormData
                .get("login[urls_attributes][0][uri]")!
                .toString(),
        ],
        login_password: "",
        iv: "",
    });

    const pendingLoginsAdd = useMutationState({
        filters: { mutationKey: ["login", "add"], status: "pending" },
        select: (mutation) =>
            transformToLogin(mutation.state.variables as FormData),
    });
    const pendingLoginsEdit = useMutationState({
        filters: { mutationKey: ["login", "edit"], status: "pending" },
        select: (mutation) =>
            transformToLogin(mutation.state.variables as FormData),
    });
    const pendingLoginsTrash = useMutationState({
        filters: { mutationKey: ["login", "trash"], status: "pending" },
        select: (mutation) => parseInt(mutation.state.variables as string),
    });

    const searchParams = $derived(
        new URLSearchParams($route.split("?")[1] || "")
    );
    let loginsQuery = $state(createQuery<{ logins: Login[] }>({
        // svelte-ignore state_referenced_locally
        queryKey: ["logins", searchParams.toString() || ""],
        queryFn: ({ signal }) =>
            queryLogins(searchParams.toString() || "", signal),
    }));
    const loginMutation = createMutation({
        mutationKey: ["login", "trash"],
        mutationFn: async (loginId: string) => {
            await mutateLogin(null, loginId, "DELETE");
        },
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
    });
    const sharedLoginMutation = createMutation({
        mutationKey: ["sharedLogins", "add"],
        mutationFn: async ({
            formData,
            loginId,
        }: {
            formData: FormData;
            loginId: string;
        }) => {
            navigate("/shared-logins/by-me");
            await mutateSharedLogin(formData, loginId);
        },
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
    });
    $effect(() => {
        $route;
        untrack(() => {
            loginsQuery = createQuery({
                queryKey: ["logins", searchParams.toString() || ""],
                queryFn: ({ signal }) =>
                    queryLogins(searchParams.toString() || "", signal),
            });
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
        {#if !$loginsQuery.isSuccess}
            <TableContentSkeleton cellNumber={4} />
        {:else}
            {#each $loginsQuery.data?.logins as login (login.login_id)}
                {@const pendingEdit = $pendingLoginsEdit.find(
                    (pendingLogin) => pendingLogin.login_id === login.login_id
                )}
                {@const pendingTrash = $pendingLoginsTrash.find(
                    (pendingLogin) => pendingLogin === login.login_id
                )}
                <Table.Row
                    class={pendingEdit
                        ? "text-green-500"
                        : pendingTrash
                          ? "text-red-500"
                          : ""}
                >
                    <Table.Cell>
                        <button
                            onclick={() =>
                                navigate("/logins/" + login.login_id + "/edit")}
                            class="w-full text-left"
                        >
                            <div class="w-full">
                                {pendingEdit?.name ?? login.name}
                            </div>
                        </button>
                    </Table.Cell>
                    <Table.Cell>{login.login_name}</Table.Cell>
                    <Table.Cell>
                        <a
                            href={((
                                pendingEdit?.urls[0] ?? login.urls[0]
                            ).includes("http") &&
                                (pendingEdit?.urls[0] ?? login.urls[0])) ||
                                "//" + (pendingEdit?.urls[0] ?? login.urls[0])}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div class="w-full">
                                {pendingEdit?.urls[0] ?? login.urls[0]}
                            </div>
                        </a>
                    </Table.Cell>
                    <Table.Cell>
                        {#if !pendingEdit && !pendingTrash && login.login_id}
                            <LoginDropdown
                                {login}
                                {loginMutation}
                                {sharedLoginMutation}
                            />
                        {/if}
                    </Table.Cell>
                </Table.Row>
            {/each}
            {#each $pendingLoginsAdd as login, index (index)}
                <Table.Row class="text-gray-500">
                    <Table.Cell>{login.name}</Table.Cell>
                    <Table.Cell>{login.login_name}</Table.Cell>
                    <Table.Cell>{login.urls[0]}</Table.Cell>
                    <Table.Cell />
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
</Table.Root>
