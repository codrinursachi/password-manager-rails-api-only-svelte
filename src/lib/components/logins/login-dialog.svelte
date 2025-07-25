<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { navigate, previousPage, route } from "$lib/router";
    import { mutateLogin } from "$lib/util/mutate-utils/mutate-login";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { toast } from "svelte-sonner";
    import { Button } from "../ui/button";
    import LoginFormInputs from "./login-form-inputs.svelte";
    import { createMutation } from "@tanstack/svelte-query";

    const params = $derived($route.split("/").slice(1));
    const loginId = $derived(params.find((param) => !isNaN(+param.toString())));
    let isNew = $derived($route.includes("new"));
    let isEditable = $derived($route.includes("edit"));
    let dialogOpen = $state(false);
    let valid = $state(false);
    const handleValid = (newValid: boolean) => {
        valid = newValid;
    };
    let loginMutation = createMutation({
        // svelte-ignore state_referenced_locally
        mutationKey: ["login", loginId ? "edit" : "add"],
        mutationFn: async (formData: FormData) => {
            await mutateLogin(formData, loginId, loginId ? "PATCH" : "POST");
        },
        onError: (error: Error, variables) => {
            toast.error(error.message, {
                description: "Failed to save login.",
                action: {
                    label: "Try again",
                    onClick: () => $loginMutation.mutate(variables),
                },
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["logins"] });
        },
    });

    $effect(() => {
        $route;
        dialogOpen = !!loginId || isNew;
        loginMutation = createMutation({
            mutationKey: ["login", loginId ? "edit" : "add"],
            mutationFn: async (formData: FormData) => {
                await mutateLogin(
                    formData,
                    loginId,
                    loginId ? "PATCH" : "POST"
                );
            },
            onError: (error: Error, variables) => {
                toast.error(error.message, {
                    description: "Failed to save login.",
                    action: {
                        label: "Try again",
                        onClick: () => $loginMutation.mutate(variables),
                    },
                });
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ["logins"] });
            },
        });
    });
</script>

<Dialog.Root
    open={dialogOpen}
    onOpenChange={(isOpen) => {
        dialogOpen = isOpen;
        if (!isOpen) {
            setTimeout(() => navigate($previousPage), 200);
        }
    }}
>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>
                {loginId ? (isEditable ? "Edit" : "View") : "Create"}{" "}
                login
            </Dialog.Title>
        </Dialog.Header>
        <Dialog.Description class="hidden">
            Enter login values
        </Dialog.Description>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                if (valid) {
                    $loginMutation.mutate(
                        new FormData(e.target as HTMLFormElement)
                    );
                    window.history.back();
                }
            }}
            encType="multipart/form-data"
        >
            <LoginFormInputs
                isEditable={isEditable || isNew}
                setValid={handleValid}
            />
            <Dialog.Footer
                class="sm:justify-start"
                hidden={!isEditable && !isNew}
            >
                <Dialog.Close>
                    {#snippet child({ props })}
                        <Button type="button" variant="secondary" {...props}
                            >Close</Button
                        >
                    {/snippet}
                </Dialog.Close>
                <Button type="submit">Save</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
