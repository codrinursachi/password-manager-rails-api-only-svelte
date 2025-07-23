<script lang="ts">
    import { route } from "$lib/router";
    import { decryptAES } from "$lib/util/crypt-utils/cryptography";
    import { querySSHKey } from "$lib/util/query-utils/query-ssh-key";
    import { generateKeyPair } from "web-ssh-keygen";
    import { Label } from "../ui/label";
    import { Skeleton } from "../ui/skeleton";
    import { Input } from "../ui/input";
    import { Button } from "../ui/button";
    import { Textarea } from "../ui/textarea";
    import { untrack } from "svelte";
    import { createQuery } from "@tanstack/svelte-query";

    const params = $route.split("/").slice(1);
    const id = params.find((param) => !isNaN(+param));
    let privateKey = $state("");
    let publicKey = $state("");
    let name = $state("");
    let notes = $state("");
    let privateKeyMasked = $state(true);
    const individualSSHKeyQuery = createQuery({
        queryKey: ["individualSSHKey", id],
        queryFn: ({ signal }) => querySSHKey(id!, signal),
        enabled: !!id,
    });
    let individualSSHKey = $state({
        name: "",
        private_key: "",
        public_key: "",
        notes: "",
        iv: "",
    });
    $effect(() => {
        $individualSSHKeyQuery.isSuccess;
        untrack(() => {
            const decryptPass = async () => {
                individualSSHKey =
                    $individualSSHKeyQuery.data!.individualSSHKey;
                const decryptedPrivateKey = await decryptAES(
                    individualSSHKey?.private_key,
                    individualSSHKey?.iv
                );
                privateKey = decryptedPrivateKey;
                publicKey = individualSSHKey.public_key;
                name = individualSSHKey?.name;
                notes = individualSSHKey?.notes;
            };
            if ($individualSSHKeyQuery.isSuccess) decryptPass();
        });
    });
    $effect(() => {
        async function generateSSHKey() {
            const {
                privateKey: generatedPrivateKey,
                publicKey: generatedPublicKey,
            } = await generateKeyPair({
                alg: "RSASSA-PKCS1-v1_5",
                size: 2048,
                hash: "SHA-256",
                name: "ssh-key",
            });

            privateKey = generatedPrivateKey;
            publicKey = generatedPublicKey;
        }

        if (!id) generateSSHKey();
    });
</script>

<div class="grid gap-4 py-4">
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="name" class="text-right">Name</Label>
        {#if $individualSSHKeyQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="name"
                class="col-span-3"
                name="sshkey[name]"
                bind:value={name}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label
            for="private-key"
            class="flex flex-col items-start text-left mb-auto"
        >
            Private key
            <div>
                <Button
                    variant={"ghost"}
                    type="button"
                    onclick={() => (privateKeyMasked = !privateKeyMasked)}
                    class="h-5 w-5"
                >
                    <i class="fas fa-eye"></i>
                </Button>
                <Button
                    variant={"ghost"}
                    type="button"
                    onclick={() => navigator.clipboard.writeText(privateKey)}
                    class="h-5 w-5"
                >
                    <i class="fas fa-clipboard"></i>
                </Button>
            </div>
        </Label>
        {#if $individualSSHKeyQuery.isFetching}
            <Skeleton class="col-span-3 h-30" hidden={!privateKeyMasked} />
        {:else}
            <Textarea
                id="private-key"
                class="col-span-3 h-30"
                readonly={true}
                value={"•".repeat(privateKey.length)}
                hidden={!privateKeyMasked}
            />
        {/if}
        {#if $individualSSHKeyQuery.isFetching}
            <Skeleton class="col-span-3 h-30" hidden={privateKeyMasked} />
        {:else}
            <Textarea
                id="private-key"
                class="col-span-3 h-30"
                name="sshkey[private_key]"
                readonly={true}
                value={privateKey}
                hidden={privateKeyMasked}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label
            for="public-key"
            class="flex flex-col items-start text-right mb-auto"
        >
            Public key
            <Button
                variant={"ghost"}
                type="button"
                onclick={() => navigator.clipboard.writeText(publicKey)}
                class="h-5 w-5"
            >
                <i class="fas fa-clipboard"></i>
            </Button>
        </Label>
        {#if $individualSSHKeyQuery.isFetching}
            <Skeleton class="col-span-3 h-30" />
        {:else}
            <Textarea
                id="public-key"
                class="col-span-3 h-30"
                name="sshkey[public_key]"
                readonly={true}
                value={publicKey}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="notes" class="text-right mb-auto">Notes</Label>
        {#if $individualSSHKeyQuery.isFetching}
            <Skeleton class="col-span-3 h-15" />
        {:else}
            <Textarea
                id="notes"
                class="col-span-3"
                name="sshkey[notes]"
                bind:value={notes}
            />
        {/if}
    </div>
</div>
