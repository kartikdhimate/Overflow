'use client';

import { getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { Profile } from "@/lib/types";
import { SortDescriptor } from "@heroui/react";
import { useRouter } from "next/navigation";

type Props = {
    profiles: Profile[];
}

export default function ProfileList({ profiles }: Props) {
    const router = useRouter();
    const columns = [
        { key: "displayName", title: "Display Name" },
        { key: "reputation", title: "Reputation" }
    ];

    const onSortChange = (sort: SortDescriptor) => {
        router.push(`/profiles?sortBy=${sort.column}`);
    }

    return (
        <Table
            onSortChange={(sort) => onSortChange(sort)}
            aria-label="User profiles"
            selectionMode="single"
            onRowAction={(key) => router.push(`/profiles/${key.toString()}`)}
        >
            <TableHeader columns={columns}>
                {(column) =>
                    <TableColumn
                        key={column.key}
                        allowsSorting
                    >
                        {column.title}
                    </TableColumn>}
            </TableHeader>
            <TableBody items={profiles}>
                {(item) => (
                    <TableRow
                        key={item.userId}
                        className="hover:cursor-pointer"
                    >
                        {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}