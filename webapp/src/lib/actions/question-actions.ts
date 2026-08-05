'use server';

import { Question, Answer } from "@/lib/types";
import type { QuestionSchema } from "@/lib/schemas/questionSchema";
import { fetchClient } from "@/lib/fetchClient";
import { AnswerSchema } from "../schemas/answerSchema";
import { revalidatePath } from "next/cache";

export async function getQuestions(tag?: string) {
    let url = '/questions';
    if (tag) url += `?tag=${tag}`;

    return fetchClient<Question[]>(url, 'GET');
}

export async function getQuestionById(id: string) {
    const url = `/questions/${id}`;

    return fetchClient<Question>(url, 'GET');
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
