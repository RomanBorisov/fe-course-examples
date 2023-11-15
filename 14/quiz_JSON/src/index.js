import * as restService from './rest.js';

const questionEl = document.querySelector('#question-text');
const answerBtns = document.querySelector('#answer-buttons');
const nextBtn = document.querySelector('#next-btn');

let currentQuestionIdx = 0;
let questions = [];
let answers = [];

window.addEventListener('DOMContentLoaded', init);

async function init() {
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

function createAnswerButton(answer) {
    const button = document.createElement('button');
    button.innerHTML = answer.text;
    button.type = 'button';
    button.classList.add('button', 'question__answer');
    answerBtns.appendChild(button);

    button.dataset.id = answer.id;
    button.addEventListener('click', selectAnswer)
}

async function selectAnswer(e) {
    const selectedBtn = e.target;
    const answerId = +selectedBtn.dataset.id;
    const {isCorrect, correctAnswerId} = await checkAnswer(answerId, questions[currentQuestionIdx].id);

    if (isCorrect) {
        selectedBtn.classList.add('question__answer--correct');
    } else {
        selectedBtn.classList.add('question__answer--incorrect');
    }

    Array.from(answerBtns.children).forEach((button) => {
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

nextBtn.addEventListener('click', async () => {
    if (currentQuestionIdx < questions.length) {
        await goToNextQuestion();
    } else {
        startQuiz();
    }
})

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

async function getQuestions() {
    return await restService.get('questions');
}

async function calculateResult(answers) {
    return await restService.post('calculate-result', {answers});
}

async function checkAnswer(answerId, questionId) {
    return await restService.post('check-answer', {answerId, questionId});
}
