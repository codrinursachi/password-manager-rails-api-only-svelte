<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { navigate } from "$lib/router";
    import { mutateSSHKey } from "$lib/util/mutate-utils/mutate-ssh-key";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { querySSHKeys } from "$lib/util/query-utils/query-ssh-keys";
    import { toast } from "svelte-sonner";
    import { Button } from "../ui/button";
    import TableContentSkeleton from "../skeletons/table-content-skeleton.svelte";
    import {
        createMutation,
        createQuery,
        useMutationState,
    } from "@tanstack/svelte-query";

    type SSHKey = {
        id: number;
        name: string;
        public_key: string;
        private_key: string;
        iv: string;
        notes: string;
    };

    const SSHKeysQuery = createQuery<{ sshKeys: SSHKey[] }>({
        queryKey: ["sshKeys"],
        queryFn: ({ signal }) => querySSHKeys(signal),
    });
    const sshKeyMutation = createMutation({
        mutationKey: ["sshKeys", "delete"],
        mutationFn: async (keyId: number) => {
            await mutateSSHKey(null, keyId.toString(), "DELETE");
        },
        onError: (error: Error, variables) => {
            toast.error(error.message, {
                description: "Error deleting SSH key",
                action: {
                    label: "Try again",
                    onClick: () => $sshKeyMutation.mutate(variables),
                },
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["sshKeys"],
            });
        },
    });
    const pendingSSHKeysDelete = useMutationState({
        filters: { mutationKey: ["sshKeys", "delete"], status: "pending" },
        select: (mutation) => mutation.state.variables,
    });
    const pendingSSHKeysAdd = useMutationState({
        filters: { mutationKey: ["sshKeys", "add"], status: "pending" },
        select: (mutation) =>
            (mutation.state.variables as { formData: FormData }).formData
                .get("sshkey[name]")!
                .toString(),
    });
    const pendingSSHKeysEdit = useMutationState({
        filters: { mutationKey: ["sshKeys", "edit"], status: "pending" },
        select: (mutation) => ({
            id: (mutation.state.variables as { keyId: string }).keyId,
            name: (mutation.state.variables as { formData: FormData }).formData
                .get("sshkey[name]")!
                .toString(),
        }),
    });
    $effect(() => {
        if ($SSHKeysQuery.error) {
            toast.error(
                $SSHKeysQuery.error instanceof Error
                    ? $SSHKeysQuery.error.message
                    : "Failed to load ssh keys.",
                {
                    description: "Failed to load ssh keys.",
                    action: {
                        label: "Retry",
                        onClick: () =>
                            queryClient.invalidateQueries({
                                queryKey: ["sshKeys"],
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
            <Table.Head class="w-14">Actions</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#if !$SSHKeysQuery.isSuccess}
            <TableContentSkeleton cellNumber={2} />
        {:else}
            {#each $SSHKeysQuery.data.sshKeys as sshKey (sshKey.id)}
                {@const pendingDelete = $pendingSSHKeysDelete.find(
                    (key) => key === sshKey.id
                )}
                {@const pendingEdit = $pendingSSHKeysEdit.find(
                    (key) => key.id === sshKey.id.toString()
                )}
                <Table.Row
                    class={pendingEdit
                        ? "text-green-500"
                        : pendingDelete
                          ? "text-red-500"
                          : ""}
                >
                    <Table.Cell>
                        <button
                            onclick={() => {
                                navigate("/ssh-keys/" + sshKey.id + "/edit");
                            }}
                            class="w-full text-left"
                            >{pendingEdit?.name ?? sshKey.name}</button
                        >
                    </Table.Cell>
                    <Table.Cell>
                        <Dialog.Root>
                            <Dialog.Trigger>
                                {#snippet child({ props })}
                                    <Button
                                        variant={"ghost"}
                                        class="cursor-pointer"
                                        {...props}
                                    >
                                        <i class="fas fa-trash-can"></i>
                                    </Button>
                                {/snippet}
                            </Dialog.Trigger>
                            <Dialog.Content>
                                <Dialog.Header>
                                    <Dialog.Title>
                                        Are you sure you want to delete key
                                        pair?
                                    </Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Description class="hidden">
                                    Delete ssh key.
                                </Dialog.Description>
                                <Dialog.Footer>
                                    <Dialog.Close>
                                        {#snippet child({ props })}
                                            <Button
                                                variant="outline"
                                                type="button"
                                                {...props}
                                            >
                                                Cancel
                                            </Button>
                                        {/snippet}
                                    </Dialog.Close>
                                    <form
                                        onsubmit={(event: Event) => {
                                            event.preventDefault();
                                            $sshKeyMutation.mutate(sshKey.id);
                                        }}
                                    >
                                        <Dialog.Close>
                                            {#snippet child({ props })}
                                                <Button
                                                    {...props}
                                                    type="submit"
                                                    variant="destructive"
                                                >
                                                    Delete
                                                </Button>
                                            {/snippet}
                                        </Dialog.Close>
                                    </form>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Root>
                    </Table.Cell>
                </Table.Row>
            {/each}
            {#each $pendingSSHKeysAdd as sshKey, index (index)}
                <Table.Row class="text-gray-500">
                    <Table.Cell>
                        <div class="w-full">{sshKey}</div>
                    </Table.Cell>
                    <Table.Cell></Table.Cell>
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
</Table.Root>
