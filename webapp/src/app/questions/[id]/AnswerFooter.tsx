'use client';

import { useAnswerStore } from "@/lib/hooks/useAnswerStore";
import { Answer } from "@/lib/types";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { handleError, timeAgo } from "@/lib/util";
import { User } from "next-auth";
import { useState, useTransition } from "react";
import { deleteAnswer } from "@/lib/actions/question-actions";

type Props = {
    answer: Answer;
    currentUser?: User | null;
};

export default function AnswerFooter({ answer, currentUser }: Props) {
    const [pending, startTransition] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState<string>("");
    const setAnswer = useAnswerStore((state) => state.setAnswer);
    const editableAnswer = useAnswerStore((state) => state.answer);

    const handleDelete = () => {
        setDeleteTarget(answer.id);
        startTransition(async () => {
            const { error } = await deleteAnswer(answer.questionId, answer.id);
            if (error) handleError(error);
            setDeleteTarget("");
        });
    }

    return (
        <div className="flex justify-between mt-4">
            <div className='flex items-center mt-auto gap-1'>
                {currentUser?.id === answer.userId &&
                    <>
                        <Button
                            isDisabled={editableAnswer !== null}
                            size='sm'
                            variant='light'
                            color='primary'
                            onPress={() => {
                                setAnswer(answer);
                                setTimeout(() => {
                                    document.getElementById("answer-form")?.scrollIntoView({ behavior: "smooth" });
                                }, 100);
                            }}
                        >Edit</Button>
                        <Button
                            size='sm'
                            variant='light'
                            color='danger'
                            isLoading={pending && deleteTarget === answer.id}
                            onPress={handleDelete}
                        >Delete</Button>
                    </>
                }
            </div>
            <div className="flex flex-col basis-2/5 bg-primary/10 px-3 py-2 gap-2 rounded-lg">
                <span className="text-sm font-extralight">answered {timeAgo(answer.createdAt)}</span>
                <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6" color="secondary" name={answer.userDisplayName.charAt(0)} />
                    <div className="flex flex-col items-center">
                        <span>{answer.userDisplayName}</span>
                        <span className="self-start text-sm font-semibold">42</span>
                    </div>
                </div>
            </div>
        </div>
    );
}