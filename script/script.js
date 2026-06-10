/*---------------------------------*/
/*        COMMON FUNCTIONS         */
/*---------------------------------*/
const sel = s => document.querySelector(s);
const create = e => document.createElement(e);
const addGlobalEventListener = (type, selector, callback) => {
    document.addEventListener(type, e => {
        if (e.target.matches(selector)) callback(e);
    });
};
const invertWord = word => word.split('').reverse().join('');



const normalWordValidation = wordCreated => {
    let wordFound = WSgame.words.find(word => word.word.toUpperCase() === wordCreated.toUpperCase());
    wordFound = wordFound ? wordFound : WSgame.words.find(word => word.word.toUpperCase() === invertWord(wordCreated).toUpperCase());

    if (wordFound && !wordFound.found) {
        wordFound.found = true;
        return wordFound;
    }
    return null;
};

const relatedWordValidation = wordCreated => {
    let wordFound = WSgame.words.find(word => word.relatedWord.toUpperCase() === wordCreated.toUpperCase());
    wordFound = wordFound ? wordFound : WSgame.words.find(word => word.relatedWord.toUpperCase() === invertWord(wordCreated).toUpperCase());

    if (wordFound && !wordFound.found) {
        wordFound.found = true;
        return wordFound;
    }
    return null;
};

const showWordDetails = word => { };

/*----------------------------------*/
/*             VARIABLES            */
/*----------------------------------*/
let isClicked = false;
let word = '';
let line_z_index = 0;
let BGColorIndex = 0;

const gameModes = {
    normal: {
        name: 'Normal',
        description: 'O modo clássico de caça palavras, onde o jogador tem que encontrar as palavras listadas.',
        validateWord: normalWordValidation,
        hasWordDetails: false
    },

    related: {
        name: 'Relacionadas',
        description: 'Nesse modo, o jogador deve buscar por palavras relacionadas às listadas. Por exemplo, se for uma relação de "antônimo", tendo listada a palavra "claro", o jogador deve procurar por "escuro".',
        validateWord: relatedWordValidation,
        hasWordDetails: false
    },

    text: {
        name: 'Texto',
        description: 'Nesse modo as palavras a serem encontradas estão destacadas em negrito em um texto.',
        validateWord: normalWordValidation,
        hasWordDetails: false
    },

    normalTranslation: {
        name: 'Tradução (normal)',
        description: 'Nesse modo, o jogador deve encontrar as palavras listadas normalmente. A diferença é que este modo permite ao jogador clicar numa palavra da lista para ver sua tradução, sua pronúncia e uma imagem.',
        validateWord: normalWordValidation,
        hasWordDetails: true,
        showWordDetailsFunction: showWordDetails
    },

    relatedTranslation: {
        name: 'Tradução (relacionadas)',
        description: 'Nesse modo, o jogador deve buscar pela tradução das palavras listadas. Além disso, este modo permite o jogador clicar numa palavra da lista para ver sua tradução, sua pronúncia e uma imagem.',
        validateWord: relatedWordValidation,
        hasWordDetails: true,
        showWordDetailsFunction: showWordDetails
    }
};

// const WSgame = {
//     level: {},
//     words: [{}],
//     letters: [],
//     gameMode: {}
// };

const WSgame = {
    level: {},
    words: [{ word: 'AS' }],
    letters: [],
    gameMode: gameModes.normal
};

const movement = {
    initialField: {
        x: null,
        y: null
    },
    endingField: {
        x: null,
        y: null
    },
    direction: null,
    line: null
};

const levels = {
    beginner: {
        name: 'beginner',
        columns: 5,
        rows: 8,
        diagonalStep: 126,
        verticalStep: 77.56
    },
    easy: {
        name: 'easy',
        columns: 7,
        rows: 11,
        diagonalStep: 127.56,
        verticalStep: 79.1
    },
    medium: {
        name: 'medium',
        columns: 9,
        rows: 15,
        diagonalStep: 125,
        verticalStep: 74.5
    },
    advanced: {
        name: 'advanced',
        columns: 10,
        rows: 16,
        diagonalStep: 126.5,
        verticalStep: 77.6
    }
};

const lineColors = [
    '#00b7ffbb',
    '#991b1bbb',
    '#146614bb',
    '#b22fb2bb',
    '#c6c600bb',
    '#32b6b6bb'
];



/*---------------------------------*/
/*            FUNCTIONS            */
/*---------------------------------*/
const fillHeaderCounting = words => {
    const foundSpan = sel('.burguer-time-count .counting .found');
    const totalSpan = sel('.burguer-time-count .counting .total');

    foundSpan.textContent = words.filter(word => word.found).length;
    totalSpan.textContent = words.length;
};

const fillWordsList = (words) => {
    const wordsListDiv = sel('.words');
    wordsListDiv.innerHTML = '';
    words.forEach(word => {
        const wordElement = create('div');
        wordElement.id = word.id;
        wordElement.textContent = word.word;
        wordsListDiv.appendChild(wordElement);
    });
};


const showTranslationWordDetails = word => {
    const detailsDiv = sel('.wordDetailsModal');
    detailsDiv.style.display = 'block';
    detailsDiv.innerHTML = `
        <h3>${word.word}</h3>
        <p>Tradução: ${word.translation}</p>
        <button class="audio"><i class="fa-solid fa-volume-high"></i></button>
        <img src="${word.image}" alt="Imagem de ${word.word}">
    `;
};


const buildGameTable = (game) => {
    fillHeaderCounting(game.words);
    fillWordsList(game.words);

    if (WSgame.gameMode.hasWordDetails)
        addWordsClickEventListener();

    sel('.letters-fields').classList.remove('begginer', 'easy', 'medium', 'advanced');
    sel('.letters-fields').classList.add(game.level.name);

    const lettersDiv = sel('.letters');
    const fieldsDiv = sel('.fields');

    lettersDiv.innerHTML = '';
    fieldsDiv.innerHTML = '';

    for (let i = 1; i <= WSgame.level.rows; i++) {
        for (let j = 1; j <= WSgame.level.columns; j++) {
            let letter = create('div');
            letter.classList.add('letter');
            letter.dataset.x = j;
            letter.dataset.y = i;
            letter.textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            lettersDiv.appendChild(letter);

            let field = create('div');
            field.classList.add('field');
            field.dataset.x = j;
            field.dataset.y = i;
            fieldsDiv.appendChild(field);
        }
    }
};

const finishMovement = () => {

    if (!isClicked) return;

    isClicked = false;

    word = sel('p.word').textContent;
    let foundWord = WSgame.gameMode.validateWord(word);

    if (foundWord) {
        markWordAsFound(foundWord);
        fillHeaderCounting(WSgame.words);
    } else {
        line_z_index--;
        movement.line.remove();
    }

    sel('.word').textContent = '';
    sel('.word').style.visibility = 'hidden';
};

const getMovementDirection = () => {
    let direction = '';
    if (movement.initialField.x === movement.endingField.x) direction = 'vertical';
    if (movement.initialField.y === movement.endingField.y) direction = 'horizontal';

    const deltaX = Math.abs(movement.endingField.x - movement.initialField.x);
    const deltaY = Math.abs(movement.endingField.y - movement.initialField.y);
    if (deltaX === deltaY) direction = 'diagonal';

    let dirLetter = '';
    if (['horizontal', 'diagonal'].includes(direction))
        dirLetter += (movement.initialField.x < movement.endingField.x) ? 'L' : 'R';
    if (['vertical', 'diagonal'].includes(direction))
        dirLetter += (movement.initialField.y < movement.endingField.y) ? 'B' : 'T';

    return direction + dirLetter;
};

const getWordCreated = () => {
    if (movement.direction.startsWith('horizontal')) return getHorizontalWord();
    if (movement.direction.startsWith('vertical')) return getVerticalWord();
    if (movement.direction.startsWith('diagonal')) return getDiagonalWord();
};

const getHorizontalWord = () => {
    let letters = [];
    const y = movement.initialField.y;
    const startX = Math.min(movement.initialField.x, movement.endingField.x);
    const endX = Math.max(movement.initialField.x, movement.endingField.x);

    for (let x = startX; x <= endX; x++) {
        const letter = sel(`.letter[data-x="${x}"][data-y="${y}"]`).textContent;
        letters.push(letter);
    }

    if (movement.initialField.x > movement.endingField.x)
        letters.reverse();

    return letters.join('');
};

const getVerticalWord = () => {
    let letters = [];
    const x = movement.initialField.x;
    const startY = Math.min(movement.initialField.y, movement.endingField.y);
    const endY = Math.max(movement.initialField.y, movement.endingField.y);

    for (let y = startY; y <= endY; y++) {
        const letter = sel(`.letter[data-x="${x}"][data-y="${y}"]`).textContent;
        letters.push(letter);
    }

    if (movement.initialField.y > movement.endingField.y)
        letters.reverse();

    return letters.join('');
};

const getDiagonalWord = () => {
    let letters = [];
    const startX = Math.min(movement.initialField.x, movement.endingField.x);
    const endX = Math.max(movement.initialField.x, movement.endingField.x);

    const startY = Math.min(movement.initialField.y, movement.endingField.y);
    const endY = Math.max(movement.initialField.y, movement.endingField.y);

    const deltaX = movement.endingField.x - movement.initialField.x;
    const deltaY = movement.endingField.y - movement.initialField.y;
    const stepX = deltaX > 0 ? 1 : -1;
    const stepY = deltaY > 0 ? 1 : -1;

    let x = Number(movement.initialField.x);
    let y = Number(movement.initialField.y);

    for (let i = 0; i <= Math.abs(deltaX); i++) {
        const letter = sel(`.letter[data-x="${x}"][data-y="${y}"]`).textContent;
        letters.push(letter);
        x += stepX;
        y += stepY;
    }

    return letters.join('');
};

const drawLine = () => {
    movement.line = create('div');
    movement.line.classList.add('line');
    movement.line.style.zIndex = line_z_index++;
    movement.line.style.backgroundColor = getLineBgColor();

    const initialFieldElement = sel('.field[data-x="' + movement.initialField.x + '"][data-y="' + movement.initialField.y + '"]');
    initialFieldElement.appendChild(movement.line);
};

const getLineBgColor = () => {
    if (BGColorIndex >= lineColors.length) BGColorIndex = 0;
    return lineColors[BGColorIndex++];
};

const stretchLine = () => {
    let step = ''
    if (movement.direction.startsWith('horizontal'))
        step = 100;
    else if (movement.direction.startsWith('vertical'))
        step = WSgame.level[`verticalStep`];
    else if (movement.direction.startsWith('diagonal'))
        step = WSgame.level[`diagonalStep`];

    const width = 80 + ((word.length - 1) * step);
    movement.line.style.width = width + '%';

    if (!movement.line.classList.contains(movement.direction)) {
        movement.line.classList.remove('horizontalL', 'horizontalR', 'verticalT', 'verticalB', 'diagonalLT', 'diagonalLB', 'diagonalRT', 'diagonalRB');
        movement.line.classList.add(movement.direction);
    }
};

const markWordAsFound = word => {
    sel(`.words #${word.id}`).classList.add('found');
};



/*---------------------------------*/
/*         EVENT LISTENERS         */
/*---------------------------------*/

addGlobalEventListener('mousedown', '.letter', e => {
    movement.initialField.x = Number(e.target.dataset.x);
    movement.initialField.y = Number(e.target.dataset.y);

    const letter = sel(`.letter[data-x="${movement.initialField.x}"][data-y="${movement.initialField.y}"]`).textContent;

    sel('.word').textContent = letter;
    sel('.word').style.visibility = 'visible';
    isClicked = true;

    drawLine();
});

addGlobalEventListener('mouseover', '.letter', e => {
    if (!isClicked) return;

    movement.endingField.x = Number(e.target.dataset.x);
    movement.endingField.y = Number(e.target.dataset.y);

    movement.direction = getMovementDirection();
    if (!movement.direction) return;

    word = getWordCreated();
    sel('.word').textContent = word;

    stretchLine();
});

document.addEventListener('mouseup', e => finishMovement());

const addWordsClickEventListener = () => {
    addGlobalEventListener('click', '.wordsList div', e => {
        const wordId = e.target.id;
        const word = WSgame.words.find(w => w.id === wordId);
        WSgame.gameMode.openWordDetails(word);
    });
}



/*--------------------------------*/
/*              MAIN              */
/*--------------------------------*/

(() => {
    const chosenLevel = 'beginner';
    WSgame.level = levels[chosenLevel];
    buildGameTable(WSgame);
})();