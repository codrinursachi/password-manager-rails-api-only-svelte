<script lang="ts">
    import { route } from "$lib/router";
    import { decryptAES } from "$lib/util/crypt-utils/cryptography";
    import { queryNote } from "$lib/util/query-utils/query-note";
    import { untrack } from "svelte";
    import { Input } from "../ui/input";
    import { Label } from "../ui/label";
    import { Skeleton } from "../ui/skeleton";
    import { Textarea } from "../ui/textarea";
    import { createQuery } from "@tanstack/svelte-query";

    const params = $route.split("/").slice(1);
    const id = params.find((param) => !isNaN(+param));
    const individualNoteQuery = createQuery({
        queryKey: ["individualNote", id],
        queryFn: ({ signal }) => queryNote(id!, signal),
        enabled: !!id,
    });
    let noteName = $state("");
    let noteText = $state("");
    let individualNote = $state({
        name: "",
        text: "",
        iv: "",
        name_iv: "",
    });
    $effect(() => {
        $individualNoteQuery.isSuccess;
        untrack(() => {
            const decryptNote = async () => {
                const [decryptedNoteName, decryptedNoteText] =
                    await Promise.all([
                        decryptAES(
                            individualNote?.name,
                            individualNote?.name_iv
                        ),
                        decryptAES(individualNote?.text, individualNote?.iv),
                    ]);

                noteName = decryptedNoteName;
                noteText = decryptedNoteText;
            };

            if ($individualNoteQuery.isSuccess) {
                individualNote = $individualNoteQuery.data.individualNote;
                decryptNote();
            }
        });
    });
</script>

<div class="grid gap-4 py-4">
    <div class="grid grid-cols-4 items-center gap-4">
        <Input type="hidden" name="note[note_id]" value={id} />
        <Label for="name" class="text-right">Name</Label>
        {#if $individualNoteQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="name"
                class="col-span-3"
                name="note[name]"
                bind:value={noteName}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="text" class="flex flex-col items-start text-left mb-auto">
            Text
        </Label>
        {#if $individualNoteQuery.isFetching}
            <Skeleton class="col-span-3 h-30" />
        {:else}
            <Textarea
                id="text"
                class="col-span-3 h-30"
                name="note[text]"
                bind:value={noteText}
            />
        {/if}
    </div>
</div>
