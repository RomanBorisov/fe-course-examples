import { IQuestion } from '../models/question';
import { get } from './rest';

export async function getQuestions() {
    return await get<IQuestion[]>('questions');
}
