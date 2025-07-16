import { writable } from "svelte/store";

export const route = writable("/");

export function navigate(path: string) {
    history.pushState({}, "", path);
    route.set(path);
}

window.onpopstate = () => {
    route.set(location.pathname);
};

route.set(location.pathname);
