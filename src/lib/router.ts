import { writable } from "svelte/store";
import { get } from "svelte/store";

export const route = writable("/");
export const previousPage = writable("/");

export function navigate(path: string) {
    history.pushState({}, "", path);
    previousPage.set(get(route));
    route.set(path);
}

window.onpopstate = () => {
    route.set(location.pathname);
};

route.set(location.pathname);
