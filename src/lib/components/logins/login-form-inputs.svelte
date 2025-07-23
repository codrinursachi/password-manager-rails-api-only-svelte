<script lang="ts">
    import { route } from "$lib/router";
    import { queryLogin } from "$lib/util/query-utils/query-login";
    import { useQuery } from "@sveltestack/svelte-query";
    import { Skeleton } from "../ui/skeleton";
    import { Input } from "../ui/input";
    import { Label } from "../ui/label";
    import { decryptAES } from "$lib/util/crypt-utils/cryptography";
    import { Textarea } from "../ui/textarea";
    import { Checkbox } from "../ui/checkbox";
    import * as Select from "$lib/components/ui/select/index.js";
    import { queryFolders } from "$lib/util/query-utils/query-folders";
    import PasswordGeneratorDialog from "./password-generator-dialog.svelte";
    import { untrack } from "svelte";

    type Folder = {
        id: number;
        name: string;
    };

    let individualLogin = $state({
        name: "",
        login_name: "",
        urls: [{ id: "", uri: "" }],
        login_password: "",
        iv: "",
        notes: "",
        custom_fields: [{ id: "", name: "", value: "" }],
        is_favorite: false,
        folder_id: 0,
    });
    let { isEditable, setValid } = $props();
    const params = $route.split("/").slice(1);
    const id = params.find((param) => !isNaN(+param));
    let name = $state("");
    let username = $state("");
    let url = $state("");
    let password = $state("");
    let urlId = $state("");
    let notes = $state("");
    let customFieldName = $state("");
    let customFieldValue = $state("");
    let customFieldId = $state("");
    let checkboxValue = $state(false);
    function changePassword(password: string) {
        password = password;
    }
    const loginQuery = useQuery(
        ["individualLogin", id],
        ({ signal }) => {
            return queryLogin(id!, signal);
        },
        {
            enabled: !!id,
            refetchOnWindowFocus: false,
        }
    );
    const folderQuery = useQuery(["folders"], ({ signal }) =>
        queryFolders(signal),
        {
            refetchOnWindowFocus: false,
        }
    );
    function handleChange() {
        if (password && name && username && url) {
            setValid(true);
        } else {
            setValid(false);
        }
    }
    let defaultFolderValue = $state("0");
    let defaultFolderName = $derived.by(() => {
        const folder = $folderQuery.data.find((folder: Folder) => folder.id === +defaultFolderValue);
        return folder ? folder.name : "";
    });
    $effect(() => {
        $folderQuery.isSuccess;
        untrack(() => {
            defaultFolderValue = $folderQuery.data
                .find((folder: Folder) => folder.name === "No folder")
                ?.id?.toString();
        });
    });
    $effect(() => {
        $loginQuery.isSuccess;
        untrack(() => {
            const decryptPass = async () => {
                const decryptedPassword = await decryptAES(
                    individualLogin?.login_password,
                    individualLogin?.iv
                );
                password = decryptedPassword;
            };
            if ($loginQuery.isSuccess) {
                individualLogin = $loginQuery.data.individualLogin;
                decryptPass();
                defaultFolderValue = individualLogin?.folder_id.toString();
                name = individualLogin?.name;
                username = individualLogin?.login_name;
                url = individualLogin?.urls[0]?.uri;
                urlId = individualLogin?.urls[0]?.id;
                notes = individualLogin?.notes;
                customFieldName = individualLogin?.custom_fields[0]?.name;
                customFieldValue = individualLogin?.custom_fields[0]?.value;
                customFieldId = individualLogin?.custom_fields[0]?.id;
                checkboxValue = individualLogin?.is_favorite;
                handleChange();
            }
        });
    });
</script>

<div class="grid gap-4 py-4" onchange={handleChange}>
    <div class="grid grid-cols-4 items-center gap-4">
        <Input type="hidden" name="login[login_id]" value={id ?? ""} />
        <Label for="name" class="text-right">Name</Label>
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="name"
                class="col-span-3"
                name="login[name]"
                defaultValue={individualLogin?.name}
                readonly={!isEditable}
                required
                bind:value={name}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="username" class="text-right">Username</Label>
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="username"
                class="col-span-3"
                name="login[login_name]"
                defaultValue={individualLogin?.login_name}
                readonly={!isEditable}
                required
                bind:value={username}
                autocomplete="off"
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="password" class="text-right">Password</Label>
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="password"
                type="password"
                class="col-span-3"
                name="login[login_password]"
                readonly={!isEditable}
                required
                bind:value={password}
                onchange={(e) => {
                    password = (e.target as HTMLInputElement).value;
                }}
                autocomplete="off"
            />
        {/if}
    </div>
    <PasswordGeneratorDialog setLoginPassword={changePassword} />
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="Url" class="text-right">Url</Label>
        <Input
            type="hidden"
            name="login[urls_attributes][0][id]"
            bind:value={urlId}
        />
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="Url"
                class="col-span-3"
                name="login[urls_attributes][0][uri]"
                defaultValue={individualLogin?.urls[0]?.uri}
                readonly={!isEditable}
                required
                bind:value={url}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="notes" class="text-right">Notes</Label>
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-24" />
        {:else}
            <Textarea
                id="notes"
                class="col-span-3"
                name="login[notes]"
                bind:value={notes}
                readonly={!isEditable}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="custom-field-name" class="text-left">
            Custom field name
        </Label>
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="custom-field-name"
                class="col-span-3"
                name="login[custom_fields_attributes][0][name]"
                bind:value={customFieldName}
                readonly={!isEditable}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="custom-field-value" class="text-left">
            Custom field value
        </Label>
        <Input
            type="hidden"
            name="login[custom_fields_attributes][0][id]"
            bind:value={customFieldId}
        />
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="custom-field-value"
                class="col-span-3"
                name="login[custom_fields_attributes][0][value]"
                bind:value={customFieldValue}
                readonly={!isEditable}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="fav-check" class="text-right">Favorite</Label>
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Checkbox
                id="fav-check"
                class="col-span-3"
                name="login[is_favorite]"
                bind:checked={checkboxValue}
                disabled={!isEditable}
            />
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right">Folder</Label>
        {#if $folderQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Select.Root
                name="login[folder_id]"
                bind:value={defaultFolderValue}
                disabled={!isEditable}
                type="single"
            >
                <Select.Trigger class="w-[295px]">
                    {defaultFolderName}
                </Select.Trigger>
                <Select.Content>
                    {#each $folderQuery.data ?? [] as folder (folder.id)}
                        <Select.Item value={folder.id.toString()}>
                            {folder.name}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        {/if}
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
        <Label for="file">File</Label>
        {#if $loginQuery.isFetching}
            <Skeleton class="col-span-3 h-8" />
        {:else}
            <Input
                id="file"
                type="file"
                class="w-[295px]"
                name="login[file]"
                disabled={!isEditable}
            />
        {/if}
    </div>
</div>
