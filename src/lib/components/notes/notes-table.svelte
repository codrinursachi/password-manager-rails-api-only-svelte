<script lang="ts">
    import TableContentSkeleton from "../skeletons/table-content-skeleton.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { queryNotes } from "$lib/util/query-utils/query-notes";
    import { toast } from "svelte-sonner";
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { decryptAES } from "$lib/util/crypt-utils/cryptography";
    import { mutateNote } from "$lib/util/mutate-utils/mutate-note";
    import { navigate } from "$lib/router";
    import { Button } from "../ui/button";
    import {
        createMutation,
        createQuery,
        useMutationState,
    } from "@tanstack/svelte-query";

    type Note = {
        id: number;
        name: string;
        name_iv: string;
        text: string;
        text_iv: string;
    };

    let notes = $state<Note[]>([]);
    const notesQuery = createQuery<{ notes: Note[] }>({
        queryKey: ["notes"],
        queryFn: ({ signal }) => queryNotes(signal),
    });
    const noteMutation = createMutation({
        mutationKey: ["note", "delete"],
        mutationFn: async (noteId: string) => {
            await mutateNote(null, noteId, "DELETE");
        },
        onError: (error: Error, variables) => {
            console.error(error);
            toast.error(error.message, {
                description: "Error deleting note",
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

    const pendingNotesAdd = useMutationState({
        filters: { mutationKey: ["note", "add"], status: "pending" },
        select: (mutation) =>
            (mutation.state.variables as FormData)
                .get("note[name]")
                ?.toString(),
    });
    const pendingNotesEdit = useMutationState({
        filters: { mutationKey: ["note", "edit"], status: "pending" },
        select: (mutation) => ({
            id: (mutation.state.variables as FormData)
                .get("note[note_id]")
                ?.toString(),
            name: (mutation.state.variables as FormData)
                .get("note[name]")
                ?.toString(),
        }),
    });
    const pendingNotesDelete = useMutationState({
        filters: { mutationKey: ["note", "delete"], status: "pending" },
        select: (mutation) => mutation.state.variables,
    });

    $effect(() => {
        if ($notesQuery.error) {
            toast.error(
                $notesQuery.error instanceof Error
                    ? $notesQuery.error.message
                    : "Unknown error",
                {
                    description: "Failed to load notes.",
                    action: {
                        label: "Retry",
                        onClick: () =>
                            queryClient.invalidateQueries({
                                queryKey: ["notes"],
                            }),
                    },
                }
            );
        }
    });
    $effect(() => {
        async function decryptNotesNames() {
            notes = await Promise.all(
                $notesQuery.data!.notes.map(async (note: Note) => ({
                    ...note,
                    name: await decryptAES(note.name, note.name_iv),
                }))
            );
        }

        if ($notesQuery.isSuccess) decryptNotesNames();
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
        {#if !$notesQuery.isSuccess}
            <TableContentSkeleton cellNumber={2} />
        {:else}
            {#each notes as note (note.id)}
                {@const pendingEdit = $pendingNotesEdit.find(
                    (pendingNote) => pendingNote.id === note.id.toString()
                )}
                {@const pendingDelete = $pendingNotesDelete.find(
                    (pendingNote) => pendingNote === note.id.toString()
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
                                navigate("/notes/" + note.id + "/edit");
                            }}
                            class="w-full text-left"
                            >{pendingEdit?.name ?? note.name}</button
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
                                        Are you sure you want to delete note?
                                    </Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Description class="hidden">
                                    Delete note
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
                                    <Dialog.Close>
                                        {#snippet child({ props })}
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                {...props}
                                                onclick={() =>
                                                    $noteMutation.mutate(
                                                        note.id.toString()
                                                    )}
                                            >
                                                Delete
                                            </Button>
                                        {/snippet}
                                    </Dialog.Close>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Root>
                    </Table.Cell>
                </Table.Row>
            {/each}
            {#each $pendingNotesAdd as note, index (index)}
                <Table.Row class="text-gray-500">
                    <Table.Cell>{note}</Table.Cell>
                    <Table.Cell></Table.Cell>
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
</Table.Root>
