import { networkFetch } from "../network-utils/network-fetch";

export async function queryNotes(signal: AbortSignal | null | undefined) {
    const response = await networkFetch("notes", signal);
    return {
        notes: response,
    };
}
