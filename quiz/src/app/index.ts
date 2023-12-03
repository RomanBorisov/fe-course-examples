import {IQuestion} from './models/question';
import {IAnswer, IUserSelectedAnswer} from './models/answer';
import {calculateResult, checkAnswer} from './services/quiz-service';
import {getQuestions} from './services/questions-service';
import './../styles/index.scss';

const questionEl = document.querySelector<HTMLHeadingElement>('#question-text') as HTMLHeadingElement;
const answerBtns = document.querySelector<HTMLDivElement>('#answer-buttons') as HTMLDivElement;
const nextBtn = document.querySelector<HTMLButtonElement>('#next-btn') as HTMLButtonElement;

let currentQuestionIdx = 0;
let questions: IQuestion[] = [];
let answers: IUserSelectedAnswer[] = [];

window.addEventListener('DOMContentLoaded', init);

async function init() {
    nextBtn.addEventListener('click', async () => {
        if (currentQuestionIdx < questions.length) {
            await goToNextQuestion();
        } else {
            startQuiz();
        }
    });

    questions = await getQuestions();

    startQuiz();
}

function startQuiz() {
    currentQuestionIdx = 0;
    showQuestion();
}

function showQuestion() {
    resetState();

    let currentQuestion = questions[currentQuestionIdx];
    let questionNumber = currentQuestionIdx + 1;

    questionEl.innerHTML = `${questionNumber}. ${currentQuestion.question}`;

    currentQuestion.answers.forEach(createAnswerButton);
}

function resetState() {
    nextBtn.style.display = 'none';
    while (answerBtns.firstChild) {
        answerBtns.removeChild(answerBtns.firstChild);
    }
}

function createAnswerButton(answer: IAnswer) {
    const button = document.createElement('button');
    button.innerHTML = answer.text;
    button.type = 'button';
    button.classList.add('button', 'question__answer');
    answerBtns.appendChild(button);

    button.dataset.id = answer.id.toString();
    button.addEventListener('click', selectAnswer);
}

async function selectAnswer(e: MouseEvent) {
    const selectedBtn = e.target as HTMLButtonElement;
    if (!selectedBtn.dataset.id) {
        throw Error('Can not find id info');
    }
    const answerId = +selectedBtn.dataset.id;
    const {isCorrect, correctAnswerId} = await checkAnswer(answerId, questions[currentQuestionIdx].id);

    if (isCorrect) {
        selectedBtn.classList.add('question__answer--correct');
    } else {
        selectedBtn.classList.add('question__answer--incorrect');
    }

    Array.from(answerBtns.children)
        .filter((element) => element instanceof HTMLButtonElement)
        .forEach((b: Element) => {
            let button: HTMLButtonElement = b as HTMLButtonElement; // If we use force typing in 80 line it does not work.

            if (!button.dataset.id) {
                throw Error('Can not find id info');
            }

            if (+button.dataset.id === correctAnswerId) {
                button.classList.add('question__answer--correct');
            }
            button.disabled = true;
        });

    answers.push({
        questionId: questions[currentQuestionIdx].id,
        answerId
    });
    nextBtn.style.display = 'block';
}

async function goToNextQuestion() {
    currentQuestionIdx++;
    if (currentQuestionIdx < questions.length) {
        showQuestion();
    } else {
        await showScore();
    }
}

async function showScore() {
    resetState();
    const {score} = await calculateResult(answers);
    answers = [];

    questionEl.innerHTML = `You scored ${score} out of ${questions.length}`;
    nextBtn.innerHTML = 'Play Again';
    nextBtn.style.display = 'block';
}
