<script lang="ts">
    import { navigate } from "$lib/router.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import startRegistration from "../../util/passkey-util/passkey-registration";
    import { mutateUserRegistration } from "../../util/mutate-utils/mutate-user-registration";
    import { createMutation } from "@tanstack/svelte-query";

    let registerWithPassword = $state(false);
    let email = $state("");
    let name = $state("");

    const initiateRegistration = createMutation({
        mutationFn: async (event: Event | null) => {
            if (!event) {
                await startRegistration(email, name);
                return;
            }
            event.preventDefault();
            await mutateUserRegistration(
                new FormData(event.target as HTMLFormElement)
            );
        },
        onError: () => {
            registerWithPassword = false;
        },
        onSuccess: () => {
            navigate("/");
        },
    });
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Register an account</Card.Title>
        <Card.Description>
            Enter your{" "}
            {!registerWithPassword ? "email" : "password"} below to register an account
        </Card.Description>
    </Card.Header>
    <Card.Content>
        <form onsubmit={$initiateRegistration.mutate}>
            <div class="flex flex-col gap-6">
                <div
                    class={"flex flex-col gap-6" +
                        (registerWithPassword ? " hidden" : "")}
                >
                    <div class="grid gap-3">
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
                    <div class="grid gap-3">
                        <div class="flex items-center">
                            <Label for="name">Name</Label>
                        </div>
                        <Input
                            id="name"
                            type="text"
                            required
                            name="name"
                            bind:value={name}
                        />
                    </div>
                    <Button
                        type="button"
                        onclick={() => $initiateRegistration.mutate(null)}
                        class="w-full"
                    >
                        Register with passkey
                    </Button>
                </div>
                <div
                    class={"flex flex-col gap-6" +
                        (registerWithPassword ? "" : " hidden")}
                >
                    <div class="grid gap-3">
                        <div class="flex items-center">
                            <Label for="password">Password</Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            name="password"
                            minlength={6}
                        />
                    </div>
                    <div class="grid gap-3">
                        <div class="flex items-center">
                            <Label for="password-confirmation">
                                Password confirmation
                            </Label>
                        </div>
                        <Input
                            id="password-confirmation"
                            type="password"
                            required
                            name="password-confirmation"
                            minlength={6}
                        />
                    </div>
                    <Button type="submit" class="w-full">Register</Button>
                </div>
                <Button
                    type="button"
                    class={"w-full" + (registerWithPassword ? " hidden" : "")}
                    onclick={() => {
                        const emailInput = document.querySelector(
                            "#email"
                        ) as HTMLInputElement | null;
                        const nameInput = document.querySelector(
                            "#name"
                        ) as HTMLInputElement | null;
                        if (
                            emailInput?.reportValidity() &&
                            nameInput?.reportValidity()
                        ) {
                            registerWithPassword = true;
                        }
                    }}
                >
                    Register with password
                </Button>
                {#if $initiateRegistration.error}
                    <Alert.Root variant="destructive">
                        <AlertCircleIcon />
                        <Alert.Title>{$initiateRegistration.error}</Alert.Title>
                    </Alert.Root>
                {/if}
            </div>
            <div class="mt-4 text-center text-sm">
                Already have an account?{" "}
                <button
                    onclick={(e) => {
                        e.preventDefault();
                        navigate("/login");
                    }}
                    class="underline underline-offset-4"
                >
                    Sign in
                </button>
            </div>
        </form>
    </Card.Content>
</Card.Root>
