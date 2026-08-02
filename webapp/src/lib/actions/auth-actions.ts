'use server';

import { auth } from "@/auth";
import { fetchClient } from "@/lib/fetchClient";

export async function testAuth() {
    return fetchClient<string>(`/test/auth`, 'GET');
}

export async function getCurrentUser() {
    try {
        const session = await auth();

        if (!session) return null;

        return session.user;
    } catch (error: unknown) {
        console.error('Error fetching current user:', error);
        return null;
    }
}
