<script lang="ts">
    import { navigate } from "../../router";
    import { Button } from "../ui/button";
</script>

<Button
    onclick={() => {
        localStorage.clear();
        navigate("/login");
    }}
>
    Logout
</Button>
