<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import Plus from "@lucide/svelte/icons/plus";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "../ui/button";
    import { Input } from "../ui/input";
    import { mutateFolder } from "$lib/util/mutate-utils/mutate-folder";
    import { toast } from "svelte-sonner";

    const folderMutation = async (formData: FormData) => {
        try {
            await mutateFolder(formData, null, "POST");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unknown error",
                {
                    description: "Error creating folder",
                    action: {
                        label: "Try again",
                        onClick: () => folderMutation(formData),
                    },
                }
            );
        }
    };
</script>

<Sidebar.GroupLabel>Folders</Sidebar.GroupLabel>
<Dialog.Root>
    <Dialog.Trigger>
        {#snippet child({ props })}
            <Sidebar.GroupAction title="Add folder" {...props}>
                <Plus /> <span class="sr-only">Add folder</span>
            </Sidebar.GroupAction>
        {/snippet}
    </Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Title>Add folder</Dialog.Title>
        <Dialog.Description class="hidden">
            Enter folder name
        </Dialog.Description>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                folderMutation(formData);
            }}
        >
            <Input type="text" name="folder[name]" />
            <br />
            <Dialog.Footer>
                <Dialog.Close>
                    {#snippet child({ props })}
                        <Button type="submit" {...props}>Create</Button>
                    {/snippet}
                </Dialog.Close>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
