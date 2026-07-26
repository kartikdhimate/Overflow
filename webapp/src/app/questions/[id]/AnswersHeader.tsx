'use client';

import { Select, SelectItem } from "@heroui/select";

type Props = {
    answersCount: number;
};

export default function AnswersHeader({ answersCount }: Props) {
    return (
        <div className="flex items-center justify-between pt-3 w-full px-6">
            <div className="text-2xl">{answersCount} {answersCount === 1 ? 'Answer' : 'Answers'}</div>
            <div className="flex items-center gap-3 justify-end w-[50%] ml-auto">
                <Select
                    aria-label="Select sorting"
                    defaultSelectedKeys={['highScore']}
                >
                    <SelectItem key="highScore">Highest score (default)</SelectItem>
                    <SelectItem key="created">Date created</SelectItem>
                </Select>
            </div>
        </div>
    );
}