import { networkFetch } from "../network-utils/network-fetch";

export async function queryLogins(queryParameters: string, signal: AbortSignal | null | undefined) {
  const response = await networkFetch(`logins?${queryParameters}`, signal);

  return {
    logins: response,
  };
}
