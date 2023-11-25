import { IUserSelectedAnswer } from '../models/answer';
import { IQuestionCheckResult, IQuizResult } from '../models/result';
import { post } from './rest';

export async function calculateResult(answers: IUserSelectedAnswer[]) {
    return await post<IQuizResult>('calculate-result', {answers});
}

export async function checkAnswer(answerId: number, questionId: number) {
    return await post<IQuestionCheckResult>('check-answer', {answerId, questionId});
}
