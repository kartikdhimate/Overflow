'use client';

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { User } from "next-auth";
import { signOut } from "next-auth/react";

type Props = {
    user: User
}

export default function UserMenu({ user }: Props) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar suppressHydrationWarning color="secondary" size="sm" name={user.displayName?.charAt(0)}></Avatar>
                    {user.displayName}
                </div>
            </DropdownTrigger>
            <DropdownMenu>
                <DropdownItem key='edit' href={`/profiles/${user.id}`}>Edit Profile</DropdownItem>
                <DropdownItem
                    key='logout'
                    className="text-danger"
                    color="danger"
                    onClick={() => signOut({ redirectTo: '/' })}
                >
                    Sign out
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
