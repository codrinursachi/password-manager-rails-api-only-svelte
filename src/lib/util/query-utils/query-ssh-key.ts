import { networkFetch } from "../network-utils/network-fetch";

export async function querySSHKey(
    keyId: string,
    signal: AbortSignal | null | undefined
) {
    const response = await networkFetch("sshkeys/" + keyId, signal);
    return {
        individualSSHKey: response,
    };
}
