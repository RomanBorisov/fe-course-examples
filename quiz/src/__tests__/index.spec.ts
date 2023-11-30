import * as questionService from '../app/services/questions-service';
import * as quizService from '../app/services/quiz-service';
import {jest} from '@jest/globals';
import {IQuestion} from '../app/models/question';
import {App} from '../app';

const questionsStub: IQuestion[] = [
    {
        id: 322,
        question: '2 + 2 = ?',
        answers: [
            {
                id: 1,
                text: '4',
                correct: true
            },
            {
                id: 2,
                text: '1',
                correct: false
            },
            {
                id: 3,
                text: '3',
                correct: false
            },
            {
                id: 4,
                text: '2',
                correct: false
            }
        ]
    },
    {
        id: 123,
        question: '3 + 2 = ?',
        answers: [
            {
                id: 1,
                text: '4',
                correct: false
            },
            {
                id: 2,
                text: '1',
                correct: false
            },
            {
                id: 3,
                text: '3',
                correct: false
            },
            {
                id: 4,
                text: '5',
                correct: true
            }
        ]
    },
];

describe('App', () => {
    let app: App;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="app wrapper__app">
            <h1 class="app__title">Quiz</h1>

            <div class="question">
                <h2 id="question-text" class="question__text"></h2>
                <div id="answer-buttons"></div>

                <button type="button" class="button button--primary question__next-btn" id="next-btn">
                    Next
                </button>
            </div>
        </div>`;

        app = new App();

        jest.spyOn(questionService, 'getQuestions')
            .mockReturnValue(Promise.resolve(questionsStub));
    });

    it('should get questions from service after init', async () => {
        expect(app.questions.length).toEqual(0);

        await app.init();

        expect(app.questions.length).toEqual(2);
        expect(app.questions[0].id).toEqual(322);
        expect(app.questions[1].id).toEqual(123);
    });

    it('should start quiz after init', async () => {
        const startQuizStub = jest.spyOn(app, 'startQuiz').mockImplementation();

        await app.init();

        expect(startQuizStub).toHaveBeenCalledTimes(1);
    });

    it('should navigate to the next question', async () => {
        await app.init();

        const initialQuestionIdx = app.currentQuestionIdx;

        await app.goToNextQuestion();

        expect(app.currentQuestionIdx).toEqual(initialQuestionIdx + 1);
    });

    it('should show the score correctly', async () => {
        jest.spyOn(quizService, 'calculateResult')
            .mockReturnValue(Promise.resolve({score: 1}));
        await app.init();
        // app.questions = questionsStub;

        app.answers.push({questionId: 322, answerId: 1});

        await app.showScore();

        expect(app.questionEl.innerHTML).toEqual(`You scored 1 out of 2`);
        expect(app.nextBtn.innerHTML).toEqual(`Play Again`);
        expect(app.nextBtn.style.display).toEqual(`block`);
    });

    it('should reset state and start quiz again', async () => {
        await app.init();

        app.currentQuestionIdx = app.questions.length;
        await app.showScore();
        await app.nextBtnHandler();

        expect(app.currentQuestionIdx).toEqual(0);
    });

    it('should show question when calling showQuestion', async () => {
        await app.init();

        app.showQuestion();

        const questionText = document.getElementById('question-text')!;
        expect(questionText.innerHTML).toEqual('1. 2 + 2 = ?');
    });

    it('should reset state when calling resetState', async () => {
        await app.init();

        app.resetState();

        expect(app.answerBtns.children.length).toEqual(0);
        expect(app.nextBtn.style.display).toEqual('none');
    });

    it('should handle click on answer button', async () => {
        jest.spyOn(quizService, 'checkAnswer')
            .mockReturnValue(Promise.resolve({isCorrect: true, correctAnswerId: 1}));
        app.questions = questionsStub;
        app.currentQuestionIdx = 0;

        const answerButton = document.createElement('button');
        answerButton.innerHTML = '4';
        answerButton.type = 'button';
        answerButton.classList.add('button', 'question__answer');
        answerButton.dataset.id = '1';

        document.getElementById('answer-buttons')!.appendChild(answerButton);

        jest.spyOn(app, 'goToNextQuestion').mockImplementation(jest.fn());

        await app.selectAnswer({target: answerButton} as MouseEvent);

        expect(answerButton.classList.contains('question__answer--correct')).toBeTruthy();
        expect(app.nextBtn.style.display).toEqual('block');
        expect(app.answers.length).toEqual(1);
    });
});
