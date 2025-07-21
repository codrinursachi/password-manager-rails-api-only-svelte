import { networkFetch } from "../network-utils/network-fetch";

export async function querySSHKeys(signal: AbortSignal | null | undefined) {
    const response = await networkFetch("sshkeys", signal);

    return {
        sshKeys: response,
    };
}
