<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Sidebar from "../ui/sidebar/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { MoreHorizontal } from "@lucide/svelte";
    import { Input } from "../ui/input";
    import { Button } from "../ui/button";
    import { toast } from "svelte-sonner";
    import { mutateFolder } from "$lib/util/mutate-utils/mutate-folder";
    import { queryClient } from "$lib/util/query-utils/query-client.js";
    import { createMutation } from "@tanstack/svelte-query";

    const { folder } = $props();
    let dropdownOpen = $state(false);
    const folderMutation = createMutation({
        mutationFn: async ({
            event,
            method,
            folderId,
        }: {
            event: Event;
            method: "PATCH" | "DELETE";
            folderId: number;
        }) => {
            event.preventDefault();
            const formData = new FormData(event.target as HTMLFormElement);
            await mutateFolder(formData, folderId.toString(), method);
        },
        onError: (error, variables) => {
            toast.error(
                error instanceof Error ? error.message : "Unknown error",
                {
                    description: "Error performing folder action",
                    action: {
                        label: "Try again",
                        onClick: () => $folderMutation.mutate(variables),
                    },
                }
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
</script>

<DropdownMenu.Root
    open={dropdownOpen}
    onOpenChange={() => {
        dropdownOpen = !dropdownOpen;
    }}
>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Sidebar.MenuAction {...props}>
                <MoreHorizontal />
            </Sidebar.MenuAction>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content side="right" align="start">
        <Dialog.Root>
            <Dialog.Trigger>
                {#snippet child({ props })}
                    <DropdownMenu.Item
                        onSelect={(event) => {
                            event.preventDefault();
                        }}
                        {...props}
                    >
                        <span>Edit folder</span>
                    </DropdownMenu.Item>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Rename folder</Dialog.Title>
                </Dialog.Header>
                <Dialog.Description class="hidden">
                    Enter folder name
                </Dialog.Description>
                <form
                    onsubmit={(event) => {
                        $folderMutation.mutate({
                            event,
                            method: "PATCH",
                            folderId: folder.id,
                        });
                    }}
                >
                    <Input
                        type="text"
                        name="folder[name]"
                        defaultValue={folder.name}
                    />
                    <br />
                    <Dialog.Footer>
                        <Dialog.Close>
                            {#snippet child({ props })}
                                <Button
                                    type="submit"
                                    onclick={() => {
                                        dropdownOpen = false;
                                    }}
                                    {...props}
                                >
                                    Confirm
                                </Button>
                            {/snippet}
                        </Dialog.Close>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>
        <Dialog.Root>
            <Dialog.Trigger>
                {#snippet child({ props })}
                    <DropdownMenu.Item
                        onSelect={(event) => {
                            event.preventDefault();
                        }}
                        {...props}
                    >
                        <span>Delete folder</span>
                    </DropdownMenu.Item>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>
                        Are you sure you want to remove the selected folder?
                    </Dialog.Title>
                </Dialog.Header>
                <Dialog.Description class="hidden">
                    Remove folder
                </Dialog.Description>
                <Dialog.Footer>
                    <Dialog.Close>
                        {#snippet child({ props })}
                            <Button
                                type="button"
                                variant="secondary"
                                onclick={() => {
                                    dropdownOpen = false;
                                }}
                                {...props}
                            >
                                Cancel
                            </Button>
                        {/snippet}
                    </Dialog.Close>
                    <Dialog.Close>
                        {#snippet child({ props })}
                            <form
                                onsubmit={(event) => {
                                    $folderMutation.mutate({
                                        event,
                                        method: "DELETE",
                                        folderId: folder.id,
                                    });
                                }}
                                {...props}
                            >
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    onclick={() => {
                                        dropdownOpen = false;
                                    }}
                                >
                                    Yes
                                </Button>
                            </form>
                        {/snippet}
                    </Dialog.Close>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    </DropdownMenu.Content>
</DropdownMenu.Root>
