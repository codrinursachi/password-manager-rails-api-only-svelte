<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import passwordGenerator from "$lib/util/password-generator";
    import { Button } from "../ui/button";
    import { Input } from "../ui/input";
    import { Label } from "../ui/label";

    const { setLoginPassword } = $props();
    let numbers = $state(6);
    let letters = $state(6);
    let specialChars = $state(6);
    let password = $state(passwordGenerator(6, 6, 6));
</script>

<Dialog.Root>
    <Dialog.Trigger>
        {#snippet child({ props })}
            <Button {...props}>Password generator</Button>
        {/snippet}
    </Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Password Generator</Dialog.Title>
            <Dialog.Description>Generate a secure password</Dialog.Description>
        </Dialog.Header>
        <Input readonly value={password}></Input>
        Options:
        <Label>Numbers:</Label>
        <Input
            type="number"
            defaultValue={6}
            min={1}
            max={64}
            bind:value={numbers}
        />
        <Label>Letters:</Label>
        <Input
            type="number"
            defaultValue={6}
            min={1}
            max={64}
            bind:value={letters}
        />
        <Label>Special characters:</Label>
        <Input
            type="number"
            defaultValue={6}
            min={1}
            max={64}
            bind:value={specialChars}
        />
        <Button
            type="button"
            onclick={() =>
                (password = passwordGenerator(numbers, letters, specialChars))}
        >
            Generate
        </Button>
        <Dialog.Footer>
            <Dialog.Close>
                {#snippet child({ props })}
                    <Button type="button" variant="secondary" {...props}
                        >Cancel</Button
                    >
                {/snippet}
            </Dialog.Close>
            <Dialog.Close>
                {#snippet child({ props })}
                    <Button
                        type="button"
                        onclick={() => setLoginPassword(password)}
                        {...props}
                    >
                        Use password
                    </Button>
                {/snippet}
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
