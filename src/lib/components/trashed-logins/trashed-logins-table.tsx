"use client";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import TrashedLoginDropdown from "./trashed-login-dropdown";
import React, { useEffect } from "react";
import { TableContentSkeleton } from "../skeletons/table-content-skeleton";
import { useQuery } from "@tanstack/react-query";
import { queryTrashedLogins } from "@/util/query-utils/query-trashed-logins";
import { toast } from "sonner";
import { queryClient } from "@/util/query-utils/query-client";

type TrashedLogin = {
    login_id: number;
    name: string;
    urls: string[];
    trash_date: string;
};

function TrashedLoginsTable() {
    const { data, error } = useQuery<{ trashedLogins: TrashedLogin[] }>({
        queryKey: ["trashedLogins"],
        queryFn: ({ signal }) => queryTrashedLogins(signal),
    });
    useEffect(() => {
        if (error) {
            toast.error(error.message, {
                description: "Failed to load trashed logins.",
                action: {
                    label: "Retry",
                    onClick: () =>
                        queryClient.invalidateQueries({
                            queryKey: ["trashedLogins"],
                        }),
                },
            });
        }
    }, [error]);
    return (
        <Table className="table-fixed">
            <TableHeader>
                <TableRow>
                    <TableHead key="name">Name</TableHead>
                    <TableHead key="url">URL</TableHead>
                    <TableHead key="trash-date">Trash date</TableHead>
                    <TableHead key="actions" className="w-16">
                        Actions
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {!data?.trashedLogins && <TableContentSkeleton cellNumber={4} />}
                {data?.trashedLogins?.map((login) => (
                    <TableRow key={login.login_id}>
                        <TableCell>
                            <Link href={"/trash/" + login.login_id}>
                                <div className="w-full">{login.name}</div>
                            </Link>
                        </TableCell>
                        <TableCell>
                            <Link
                                href={
                                    (login.urls[0].includes("http") &&
                                        login.urls[0]) ||
                                    "//" + login.urls[0]
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className="w-full">{login.urls[0]}</div>
                            </Link>
                        </TableCell>
                        <TableCell>{login.trash_date}</TableCell>
                        <TableCell>
                            <TrashedLoginDropdown login={login} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default TrashedLoginsTable;
