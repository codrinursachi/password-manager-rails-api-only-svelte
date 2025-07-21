<script lang="ts">
    import { mutateTrashedLogin } from "$lib/util/mutate-utils/mutate-trashed-login";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { useMutation } from "@sveltestack/svelte-query";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Button, Root } from "../ui/button";
    import { MoreHorizontal } from "@lucide/svelte";

    const { login } = $props();
    let dropdownOpen = $state(false);
    const trashedLoginMutation = useMutation(
        async ({
            loginId,
            method,
        }: {
            loginId: number;
            method: "DELETE" | "PATCH";
        }) => {
            await mutateTrashedLogin(loginId.toString(), method);
        },
        {
            onError: (error: Error, variables) => {
                console.error(error);
                toast.error(error.message, {
                    description: "Error performing trashed login action",
                    action: {
                        label: "Try again",
                        onClick: () => $trashedLoginMutation.mutate(variables),
                    },
                });
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ["trashedLogins"] });
            },
        }
    );
</script>

<DropdownMenu.Root
    open={dropdownOpen}
    onOpenChange={(isOpen) => (dropdownOpen = isOpen)}
>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <MoreHorizontal {...props} />
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content side="left" align="start">
        <DropdownMenu.Item>
            <form
                onsubmit={(event) => {
                    event.preventDefault();
                    $trashedLoginMutation.mutate({
                        loginId: login.login_id,
                        method: "PATCH",
                    });
                }}
            >
                <button type="submit">Restore login</button>
            </form>
        </DropdownMenu.Item>
        <Dialog.Root>
            <Dialog.Trigger>
                {#snippet child({ props })}
                    <DropdownMenu.Item
                        {...props}
                        onSelect={(event) => event.preventDefault()}
                    >
                        Delete login
                    </DropdownMenu.Item>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>
                        Are you sure you want to delete login?
                    </Dialog.Title>
                </Dialog.Header>
                <Dialog.Description class="hidden">
                    Delete login.
                </Dialog.Description>
                <Dialog.Footer>
                    <Dialog.Close>
                        {#snippet child({ props })}
                            <Button {...props} variant="outline">Cancel</Button>
                        {/snippet}
                    </Dialog.Close>
                    <form
                        onsubmit={(event) => {
                            event.preventDefault();
                            $trashedLoginMutation.mutate({
                                loginId: login.login_id,
                                method: "DELETE",
                            });
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
    </DropdownMenu.Content>
</DropdownMenu.Root>
