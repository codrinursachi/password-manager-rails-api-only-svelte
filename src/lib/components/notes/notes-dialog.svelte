<script lang="ts">
    import { route } from "$lib/router";
    import { mutateNote } from "$lib/util/mutate-utils/mutate-note";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "../ui/button";
    import NotesFormInputs from "./notes-form-inputs.svelte";
    import { createMutation } from "@tanstack/svelte-query";

    const params = $derived($route.split("/").slice(1));
    const noteId = $derived(params.find((param) => !isNaN(+param.toString())));
    const isNew = $derived($route.includes("new"));
    let dialogOpen = $state(false);
    let noteMutation = createMutation({
        mutationKey: ["note", () => (noteId ? "edit" : "add")],
        mutationFn: async (formData: FormData) => {
            await mutateNote(formData, noteId, noteId ? "PATCH" : "POST");
        },
        onError: (error: Error, variables) => {
            toast.error(error.message, {
                description: "Error saving note",
                action: {
                    label: "Try again",
                    onClick: () => $noteMutation.mutate(variables),
                },
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
    });
    $effect(() => {
        dialogOpen = !!noteId || isNew;
        noteMutation = createMutation({
            mutationKey: ["note", noteId ? "edit" : "add"],
            mutationFn: async (formData: FormData) => {
                await mutateNote(formData, noteId, noteId ? "PATCH" : "POST");
            },
            onError: (error: Error, variables) => {
                toast.error(error.message, {
                    description: "Error saving note",
                    action: {
                        label: "Try again",
                        onClick: () => $noteMutation.mutate(variables),
                    },
                });
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ["notes"] });
            },
        });
    });
</script>

<Dialog.Root
    open={dialogOpen}
    onOpenChange={(isOpen) => {
        dialogOpen = isOpen;
        if (!isOpen) {
            setTimeout(() => window.history.back(), 200);
        }
    }}
>
    <Dialog.Content class="sm:max-w-lg">
        <Dialog.Header>
            <Dialog.Title>{noteId ? "Edit" : "Create"} note</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description class="hidden">
            {noteId ? "Edit" : "Create"} note
        </Dialog.Description>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                $noteMutation.mutate(formData);
            }}
        >
            <NotesFormInputs />
            <Dialog.Footer class="sm:justify-start">
                <Dialog.Close>
                    {#snippet child({ props })}
                        <Button type="button" variant="secondary" {...props}
                            >Close</Button
                        >
                    {/snippet}
                </Dialog.Close>
                <Dialog.Close>
                    {#snippet child({ props })}
                        <Button {...props} type="submit">Save</Button>
                    {/snippet}
                </Dialog.Close>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
