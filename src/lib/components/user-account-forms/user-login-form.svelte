<script lang="ts">
    import { navigate } from "$lib/router.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import { mutateUserLogin } from "../../util/mutate-utils/mutate-user-login";
    import startAuthentication from "../../util/passkey-util/passkey-authentication";
    import { useMutation } from "@sveltestack/svelte-query";

    let loginWithPassword = $state(false);
    let email = $state("");

    const initiateLogin = useMutation(
        async (event: Event | null) => {
            if (!event) {
                await startAuthentication(email);
                return;
            }

            event.preventDefault();
            await mutateUserLogin(
                new FormData(event.target as HTMLFormElement)
            );
        },
        {
            onError: () => {
                loginWithPassword = false;
            },
            onSuccess: () => {
                navigate("/");
            },
        }
    );
</script>

<Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
        <Card.Title class="text-2xl">Login to your account</Card.Title>
        <Card.Description
            >Enter your {loginWithPassword ? "password" : "email"}{" "}
            below to login to your account</Card.Description
        >
    </Card.Header>
    <Card.Content>
        <form onsubmit={$initiateLogin.mutate}>
            <div class="grid gap-4">
                <div
                    class={"grid gap-2" + (loginWithPassword ? " hidden" : "")}
                >
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        name="email"
                        bind:value={email}
                    />
                </div>
                <Button
                    type="button"
                    class={"w-full" + (loginWithPassword ? " hidden" : "")}
                    onclick={() => $initiateLogin.mutate(null)}
                >
                    Login with passkey
                </Button>
                <div
                    class={"grid gap-3" + (!loginWithPassword ? " hidden" : "")}
                >
                    <div class="flex items-center">
                        <Label for="password">Password</Label>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        required
                        minlength={6}
                    />
                </div>
                <Button
                    type="button"
                    class={"w-full" + (loginWithPassword ? " hidden" : "")}
                    onclick={() => {
                        const emailInput = document.querySelector(
                            "#email"
                        ) as HTMLInputElement | null;
                        if (emailInput?.reportValidity())
                            loginWithPassword = true;
                    }}
                >
                    Login with password
                </Button>
                <Button
                    type="submit"
                    class={"w-full" + (!loginWithPassword ? " hidden" : "")}
                >
                    Login
                </Button>
                {#if $initiateLogin.error}
                    <Alert.Root variant="destructive">
                        <AlertCircleIcon />
                        <Alert.Title>{$initiateLogin.error}</Alert.Title>
                    </Alert.Root>
                {/if}
            </div>
            <div class="mt-4 text-center text-sm">
                Don't have an account?
                <button
                    onclick={(e) => {
                        e.preventDefault();
                        navigate("/register");
                    }}
                    class="underline"
                >
                    Sign up
                </button>
            </div>
        </form></Card.Content
    >
</Card.Root>
