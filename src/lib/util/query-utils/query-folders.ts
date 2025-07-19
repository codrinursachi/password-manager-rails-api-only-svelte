import { networkFetch } from "../network-utils/network-fetch";

export async function queryFolders(signal: AbortSignal | null | undefined) {
    const response = await networkFetch("folders", signal);

    return response;
}
