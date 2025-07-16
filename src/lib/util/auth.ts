import { navigate } from "$lib/router";

export function getTokenDuration() {
    const expiration = localStorage.getItem("expiration");
    const expirationDate = new Date(expiration || "");
    const now = new Date();
    const duration = expirationDate.getTime() - now.getTime();
    return duration;
}

export function getAuthToken() {
    const token = localStorage.getItem("token");
    const duration = getTokenDuration();
    if (duration < 0) {
        return "EXPIRED";
    }

    return token ? "Bearer " + token : token;
}

export function checkAuthLoader() {
    const token = getAuthToken();
    if (token === "EXPIRED") {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
    }
    if (!token || token === "EXPIRED") {
        return navigate("/login");
    }

    return null;
}
