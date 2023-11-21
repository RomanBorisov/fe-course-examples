export interface IAnswer {
    id: number;
    text: string;
    correct: boolean;
}

export interface IUserSelectedAnswer {
    questionId: number;
    answerId: number;
}
