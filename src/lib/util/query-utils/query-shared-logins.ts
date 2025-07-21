import { networkFetch } from "../network-utils/network-fetch";

export async function querySharedLogins(
    queryParameter: string,
    signal: AbortSignal | null | undefined
) {
    const response = await networkFetch(
        "shared_login_data?" + queryParameter,
        signal
    );

    return {
        sharedLogins: response,
    };
}
