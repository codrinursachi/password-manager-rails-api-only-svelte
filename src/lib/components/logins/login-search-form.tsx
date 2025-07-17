"use client";
import { redirect } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function LoginSearchForm() {
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get("search")?.toString() || "";
        redirect("/logins" + `?q=${query}`);
    };

    return (
        <form
            className="flex w-full max-w-sm items-center space-x-2"
            onSubmit={handleSearch}
        >
            <Input type="text" name="search" />
            <Button type="submit">Search</Button>
        </form>
    );
}

export default LoginSearchForm;