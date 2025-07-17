"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotesFormInputs from "./notes-form-inputs";
import { useMutation } from "@tanstack/react-query";
import { mutateNote } from "@/util/mutate-utils/mutate-note";
import { queryClient } from "@/util/query-utils/query-client";
import { toast } from "sonner";

function NotesDialog() {
    const params = useParams().noteId ?? [];
    const noteId = !isNaN(Number(params[0])) ? params[0] : undefined;
    const isNew = usePathname().includes("new");
    const [dialogOpen, setDialogOpen] = useState(false);
    useEffect(() => {
        setDialogOpen(noteId !== undefined || isNew);
    }, [noteId, isNew]);
    const navigate = useRouter();
    const noteMutation = useMutation({
        mutationFn: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.target as HTMLFormElement);
            await mutateNote(formData, noteId, noteId ? "PATCH" : "POST");
        },
        mutationKey: ["note", noteId ? "edit" : "add"],
        onError: (error: Error) => {
            toast.error(error.message, {
                description: "Error saving note",
                action: {
                    label: "Try again",
                    onClick: () => noteMutation.mutate(noteMutation.variables!),
                },
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
    });
    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(isOpen) => {
                setDialogOpen(isOpen);
                if (!isOpen) {
                    setTimeout(() => navigate.back(), 200);
                }
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{noteId ? "Edit" : "Create"} note</DialogTitle>
                </DialogHeader>
                <DialogDescription className="hidden">
                    {noteId ? "Edit" : "Create"} note
                </DialogDescription>
                <form onSubmit={noteMutation.mutate}>
                    <NotesFormInputs />
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="submit">Save</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default NotesDialog;
