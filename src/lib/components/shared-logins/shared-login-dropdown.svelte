<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { route } from "$lib/router";
    import {
        decryptAES,
        decryptRSAPassword,
    } from "$lib/util/crypt-utils/cryptography";
    import { mutateSharedLogin } from "$lib/util/mutate-utils/mutate-shared-login";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { queryLogin } from "$lib/util/query-utils/query-login";
    import { MoreHorizontal } from "@lucide/svelte";
    import { createMutation } from "@tanstack/svelte-query";
    import { toast } from "svelte-sonner";

    const getPasswordSharedByMe = async (id: string) => {
        const { individualLogin } = await queryClient.fetchQuery({
            queryKey: ["individualLogin", id],
            queryFn: ({ signal }) => queryLogin(id, signal),
        });
        return decryptAES(individualLogin.login_password, individualLogin.iv);
    };

    const getPasswordSharedWithMe = async (password: string) => {
        return decryptRSAPassword(password);
    };

    const { login } = $props();
    const byMe = $derived($route.includes("by-me"));
    let dropdownOpen = $state(false);
    const sharedLoginMutation = createMutation({
        mutationKey: ["sharedLogins", "delete"],
        mutationFn: async (loginId: string) => {
            await mutateSharedLogin(null, loginId);
        },
        onError: (error: Error, variables) => {
            toast.error(error.message, {
                description: "Error deleting shared login",
                action: {
                    label: "Try again",
                    onClick: () => $sharedLoginMutation.mutate(variables),
                },
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["sharedLogins", byMe ? "by_me=true" : ""],
            });
        },
    });
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
    <DropdownMenu.Content side="right" align="start">
        <DropdownMenu.Item>
            <button
                onclick={() => navigator.clipboard.writeText(login.login_name)}
            >
                Copy username
            </button>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
            <button
                onclick={async () =>
                    byMe
                        ? navigator.clipboard.writeText(
                              await getPasswordSharedByMe(
                                  login.login_id.toString()
                              )
                          )
                        : navigator.clipboard.writeText(
                              await getPasswordSharedWithMe(
                                  login.login_password
                              )
                          )}
            >
                Copy password
            </button>
        </DropdownMenu.Item>
        {#if login.file}
            <DropdownMenu.Item>
                <a
                    href={"http://127.0.0.1:3000" + login.file}
                    download
                    target="_self"
                >
                    Download file
                </a>
            </DropdownMenu.Item>
        {/if}
        <form
            onsubmit={(event) => {
                event.preventDefault();
                $sharedLoginMutation.mutate(login.id.toString());
            }}
        >
            <button type="submit">
                <DropdownMenu.Item>
                    <span>Delete shared login</span>
                </DropdownMenu.Item>
            </button>
        </form>
    </DropdownMenu.Content>
</DropdownMenu.Root>
