<script lang="ts">
    import { queryClient } from "$lib/util/query-utils/query-client";
    import { navigate } from "../../router";
    import { Button } from "../ui/button";
</script>

<Button
    onclick={() => {
        localStorage.clear();
        queryClient.clear();
        navigate("/login");
    }}
>
    Logout
</Button>
