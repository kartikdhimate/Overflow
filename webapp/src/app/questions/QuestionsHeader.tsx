'use client';

import { Button, Tab, Tabs } from "@heroui/react";
import Link from "next/link";

type Props = {
    tag?: string;
    total: number;
}

export default function QuestionsHeader({ tag, total }: Props) {
    const tabs = [
        {key: 'newest', label: 'Newest'},
        {key: 'active', label: 'Active'},
        {key: 'unanswered', label: 'Unanswered'},
    ];

    return (
        <div className="flex flex-col w-full border-b gap-4 pb-4">
            <div className="flex justify-between px-6">
                <div className="text-3xl font-semibold">
                    {tag ? `[${tag}]` : 'Newest Questions'}
                </div>
                <Button as={Link} href="/questions/ask" color="secondary">
                    Ask Question
                </Button>
            </div>
            <div className="flex justify-between px-6 items-center">
                <div>{total} {total === 1 ? 'question' : 'questions'}</div>
                <div className="flex items-center">
                    <Tabs>
                        {tabs.map(tab => (
                            <Tab key={tab.key} title={tab.label}></Tab>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}