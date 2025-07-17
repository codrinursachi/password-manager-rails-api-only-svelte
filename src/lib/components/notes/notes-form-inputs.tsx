import { useQuery } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useParams } from "next/navigation";
import { decryptAES } from "@/util/crypt-utils/cryptography";
import { useEffect, useState } from "react";
import { queryNote } from "@/util/query-utils/query-note";
import { Skeleton } from "../ui/skeleton";

function NotesFormInputs() {
    const params = useParams().noteId || [];
    const id = !isNaN(Number(params[0])) ? params[0] : "";
    const { data, isFetching } = useQuery({
        queryKey: ["individualNote", id],
        queryFn: ({ signal }) => queryNote(id!, signal),
        enabled: !!id,
    });
    const [noteName, setNoteName] = useState("");
    const [noteText, setNoteText] = useState("");
    const individualNote = data?.individualNote;
    useEffect(() => {
        const decryptNote = async () => {
            const [noteName, noteText] = await Promise.all([
                decryptAES(individualNote?.name, individualNote?.name_iv),
                decryptAES(individualNote?.text, individualNote?.iv),
            ]);

            setNoteName(noteName);
            setNoteText(noteText);
        };
        if (data) decryptNote();
    }, [data]);
    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Input type="hidden" name="note[note_id]" value={id} />
                <Label htmlFor="name" className="text-right">
                    Name
                </Label>
                {isFetching ? (
                    <Skeleton className="col-span-3 h-8" />
                ) : (
                    <Input
                        id="name"
                        className="col-span-3"
                        name="note[name]"
                        defaultValue={noteName}
                    />
                )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label
                    htmlFor="text"
                    className="flex flex-col items-start text-left mb-auto"
                >
                    Text
                </Label>
                {isFetching ? (
                    <Skeleton className="col-span-3 h-30" />
                ) : (
                    <Textarea
                        id="text"
                        className="col-span-3 h-30"
                        name="note[text]"
                        defaultValue={noteText}
                    />
                )}
            </div>
        </div>
    );
}
export default NotesFormInputs;
