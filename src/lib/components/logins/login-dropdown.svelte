<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { MoreHorizontal } from "@lucide/svelte";
    import { decryptAES } from "$lib/util/crypt-utils/cryptography";
    import { navigate } from "$lib/router";
    import { Input } from "../ui/input";
    import { Button } from "../ui/button";

    const { login, loginMutation, sharedLoginMutation } = $props();
    let dropdownOpen = $state(false);
</script>

<DropdownMenu.Root
    open={dropdownOpen}
    onOpenChange={() => (dropdownOpen = !dropdownOpen)}
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
                    navigator.clipboard.writeText(
                        await decryptAES(login.login_password, login.iv)
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
        <DropdownMenu.Item>
            {#snippet child({ props })}
                <button
                    {...props}
                    onclick={() =>
                        navigate("/logins/" + login.login_id + "/edit")}
                >
                    <span class="w-full">Edit login</span>
                </button>
            {/snippet}
        </DropdownMenu.Item>
        <Dialog.Root>
            <Dialog.Trigger>
                {#snippet child({ props })}
                    <DropdownMenu.Item
                        onSelect={(event) => {
                            event.preventDefault();
                        }}
                        {...props}
                    >
                        <span>Share login</span>
                    </DropdownMenu.Item>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Share login with:</Dialog.Title>
                </Dialog.Header>
                <Dialog.Description class="hidden">
                    Enter email address to share login.
                </Dialog.Description>
                <form
                    onsubmit={(event) => {
                        event.preventDefault();
                        $sharedLoginMutation.mutate({
                            loginId: login.login_id.toString(),
                            formData: new FormData(event.currentTarget),
                        });
                    }}
                >
                    <Input
                        type="hidden"
                        name="shared_login_datum[name]"
                        value={login.login_name}
                    />
                    <Input
                        type="hidden"
                        name="shared_login_datum[login_name]"
                        value={login.login_name}
                    />
                    <Input
                        type="hidden"
                        name="shared_login_datum[urls_attributes][0][uri]"
                        value={login.urls[0]}
                    />
                    <Input type="text" name="shared_login_datum[email]" />
                    <br />
                    <Dialog.Footer>
                        <Dialog.Close>
                            {#snippet child({ props })}
                                <Button
                                    type="submit"
                                    onclick={() => {
                                        dropdownOpen = false;
                                    }}
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
                        <span>Send to trash</span>
                    </DropdownMenu.Item>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>
                        Are you sure you want to send to trash?
                    </Dialog.Title>
                </Dialog.Header>
                <Dialog.Description class="hidden">
                    Send login to trash.
                </Dialog.Description>
                <Dialog.Footer>
                    <Dialog.Close>
                        {#snippet child({ props })}
                            <Button
                                variant="outline"
                                onclick={() => {
                                    dropdownOpen = false;
                                }}
                                {...props}
                            >
                                No
                            </Button>
                        {/snippet}
                    </Dialog.Close>
                    <Dialog.Close>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                type="button"
                                onclick={() => {
                                    $loginMutation.mutate(
                                        login.login_id.toString()
                                    );
                                    dropdownOpen = false;
                                }}
                            >
                                Yes
                            </Button>
                        {/snippet}
                    </Dialog.Close>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    </DropdownMenu.Content>
</DropdownMenu.Root>
