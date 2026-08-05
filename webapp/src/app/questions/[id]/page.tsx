import { getQuestionById } from "@/lib/actions/question-actions";
import { notFound } from "next/navigation";
import QuestionDetailedHeader from "./QuestionDetailedHeader";
import QuestionContent from "./QuestionContent";
import AnswerContent from "./AnswerContent";
import AnswersHeader from "./AnswersHeader";
import AnswerForm from "@/app/questions/[id]/AnswerForm";

type Params = Promise<{ id: string }>;

export default async function QuestionDetailedPage({ params }: { params: Params }) {
    const { id } = await params;
    const { data: question, error } = await getQuestionById(id);

    if (error) throw error;
    if (!question) return notFound();

    return (
        <div className="w-full">
            <QuestionDetailedHeader question={question} />
            <QuestionContent question={question} />
            {question.answers.length > 0 && (
                <AnswersHeader answersCount={question.answers.length} />
            )}
            {question.answers.map((answer) => (
                <AnswerContent key={answer.id} answer={answer} />
            ))}
            <AnswerForm questionId={question.id} />
        </div>
    );
}
