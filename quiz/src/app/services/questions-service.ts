import { IQuestion } from '../models/question';
import { get } from './rest.js';

export async function getQuestions() {
    return await get<IQuestion[]>('questions');
}
