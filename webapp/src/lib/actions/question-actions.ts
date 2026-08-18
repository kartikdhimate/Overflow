'use server';

import { Question, Answer, FetchResponse, Profile, VoteRecord, Vote } from "@/lib/types";
import type { QuestionSchema } from "@/lib/schemas/questionSchema";
import { fetchClient } from "@/lib/fetchClient";
import { AnswerSchema } from "../schemas/answerSchema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getQuestions(tag?: string): Promise<FetchResponse<Question[]>> {
    let questionUrl = '/questions';
    if (tag) questionUrl += `?tag=${tag}`;

    const { data: questions, error: questionsError } = await fetchClient<Question[]>(questionUrl, 'GET');

    if (!questions || questionsError) {
        return {
            data: null,
            error: { message: 'Failed to fetch questions', status: 500 }
        }
    }

    const userIds = Array.from(new Set(questions.map(q => q.askerId)));
    if (userIds.length === 0) return { data: [] };

    const ids = Array.from(userIds).sort();
    const profilesUrl = "/profiles/batch?" + new URLSearchParams({ ids: ids.join(',') });
    const { data: profiles, error: profilesError } = await fetchClient<Profile[]>(profilesUrl, 'GET', { cache: "force-cache", next: { revalidate: 3600 } });

    if (profilesError) return { data: null, error: { message: 'Failed to fetch profiles', status: 500 } };

    const profileMap = new Map(profiles?.map(profile => [profile.userId, profile]));

    const enriched = questions.map(question => ({
        ...question,
        author: profileMap.get(question.askerId)
    }));

    return { data: enriched };
}

export async function getQuestionById(id: string): Promise<FetchResponse<Question>> {
    const url = `/questions/${id}`;

    const { data: question, error: questionError } = await fetchClient<Question>(url, 'GET');

    if (!question || questionError) return { data: null, error: { message: 'Failed to fetch question', status: 500 } };

    const userIds = new Set<string>();
    if (question.askerId) userIds.add(question.askerId);
    for (const a of question.answers ?? []) userIds.add(a.userId);

    if (userIds.size === 0) return { data: null, error: { message: 'No user IDs found for question', status: 500 } };

    const ids = Array.from(userIds).sort();
    const profilesUrl = "/profiles/batch?" + new URLSearchParams({ ids: ids.join(',') });
    const { data: profiles, error: profilesError } = await fetchClient<Profile[]>(profilesUrl, 'GET', { cache: "force-cache", next: { revalidate: 3600 } });

    if (profilesError) return { data: null, error: { message: 'Failed to fetch profiles', status: 500 } };

    const profileMap = new Map(profiles?.map(profile => [profile.userId, profile]));

    const session = await auth();
    let voteMap = new Map<string, number>();

    if (session) {
        const voteUrl = `/votes/${id}`;
        const { data: votes, error: votesError } = await fetchClient<VoteRecord[]>(voteUrl, 'GET');

        if (votesError) return { data: null, error: { message: 'Failed to fetch votes', status: 500 } };

        voteMap = new Map((votes ?? []).map(vote => [vote.targetId, vote.voteType]));
    }

    const getUserVote = (targetId: string) => voteMap.get(targetId) ?? 0;

    const enriched: Question = {
        ...question,
        author: profileMap.get(question.askerId),
        userVoted: getUserVote(question.id),
        answers: (question.answers ?? []).map(answer => ({
            ...answer,
            author: profileMap.get(answer.userId),
            userVoted: getUserVote(answer.id)
        }))
    }

    return { data: enriched };
}

export async function searchQuestions(query: string) {
    return fetchClient<Question[]>(`/search?query=${query}`, 'GET');
}

export async function postQuestion(question: QuestionSchema) {
    return fetchClient<Question>('/questions', 'POST', { body: question });
}

export async function updateQuestion(id: string, question: QuestionSchema) {
    return fetchClient(`/questions/${id}`, 'PUT', { body: question });
}

export async function deleteQuestion(id: string) {
    return fetchClient(`/questions/${id}`, 'DELETE');
}

export async function postAnswer(data: AnswerSchema, questionId: string) {
    const result = await fetchClient<Answer>(`/questions/${questionId}/answers`, 'POST', { body: data });

    revalidatePath(`/questions/${questionId}`);
    return result;
}

export async function editAnswer(data: AnswerSchema, questionId: string, answerId: string) {
    const result = await fetchClient(`/questions/${questionId}/answers/${answerId}`, 'PUT', { body: data });

    revalidatePath(`/questions/${questionId}`);
    return result;
}

export async function deleteAnswer(questionId: string, answerId: string) {
    const result = await fetchClient(`/questions/${questionId}/answers/${answerId}`, 'DELETE');

    revalidatePath(`/questions/${questionId}`);
    return result;
}

export async function acceptAnswer(answerId: string, questionId: string) {
    const result = await fetchClient(`/questions/${questionId}/answers/${answerId}/accept`, "POST");

    revalidatePath(`/questions/${questionId}`);
    return result;
}

export async function addVote(vote: Vote) {
    const result = await fetchClient(`/votes`, "POST", { body: vote });

    revalidatePath(`/questions/${vote.questionId}`);
    return result;
}
