/*---------------------------------
           COMMON FUNCTIONS
 ---------------------------------*/
const sel = s => document.querySelector(s);
const create = e => document.createElement(e);
const globalEventListener = (type, selector, callback) => {
    document.addEventListener(type, e => {
        if (e.target.matches(selector)) callback(e);
    });
}



/*---------------------------------
              FUNCTIONS
 ---------------------------------*/

const buildGameTable = (level) => {
    console.log(level);

    const lettersDiv = sel('.letters');
    const fieldsDiv = sel('.fields');

    lettersDiv.innerHTML = '';
    fieldsDiv.innerHTML = '';

    lettersDiv.style.gridTemplateColumns = `repeat(${level.columns}, 1fr)`;
    lettersDiv.style.gridTemplateRows = `repeat(${level.rows}, 1fr)`;

    fieldsDiv.style.gridTemplateColumns = `repeat(${level.columns}, 1fr)`;
    fieldsDiv.style.gridTemplateRows = `repeat(${level.rows}, 1fr)`;

    for (let i = 1; i <= level.rows; i++) {
        for (let j = 1; j <= level.columns; j++) {
            let letter = create('div');
            letter.classList.add('letter');
            letter.textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            letter.dataset.x = j;
            letter.dataset.y = i;
            lettersDiv.appendChild(letter);

            let field = create('div');
            field.classList.add('field');
            field.dataset.x = j;
            field.dataset.y = i;
            fieldsDiv.appendChild(field);
        }
    }
}

const finishMovement = () => {
    isClicked = false;
    sel('.word').textContent = '';
    sel('.word').style.visibility = 'hidden';
}

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
}

const getWordCreated = () => {
    if (movement.direction.startsWith('horizontal')) return getHorizontalWord();
    if (movement.direction.startsWith('vertical')) return getVerticalWord();
    if (movement.direction.startsWith('diagonal')) return getDiagonalWord();
}

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
}

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
}

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
}

const drawLine = () => {
    movement.line = create('div');
    movement.line.classList.add('line');
    movement.line.style.backgroundColor = lineColors[Math.floor(Math.random() * lineColors.length)];

    const initialFieldElement = sel('.letter[data-x="' + movement.initialField.x + '"][data-y="' + movement.initialField.y + '"]');
    initialFieldElement.appendChild(movement.line);
}

const stretchLine = () => {
    let step = ''
    if (movement.direction.startsWith('horizontal'))
        step = 100;
    else if (movement.direction.startsWith('vertical'))
        step = level.rotate[`verticalStep`];
    else if (movement.direction.startsWith('diagonal'))
        step = level.rotate[`diagonalStep`];

    const width = 80 + ((word.length - 1) * step);
    movement.line.style.width = width + '%';
    movement.line.style.transformOrigin = level.rotate.transformOriginX + ' center'; // reset rotation

    switch (movement.direction) {
        case 'horizontalL':
            movement.line.style.transform = 'rotate(0deg)'; break;
        case 'horizontalR':
            movement.line.style.transform = 'rotate(180deg)'; break;
        case 'verticalT':
            movement.line.style.transform = 'rotate(-90deg)'; break;
        case 'verticalB':
            movement.line.style.transform = 'rotate(90deg)'; break;
        default:
            movement.line.style.transform = `rotate(${level.rotate[movement.direction]}deg)`;
    }
}



/*---------------------------------
            EVENT LISTENERS
 ---------------------------------*/
globalEventListener('mousedown', '.field', e => {
    movement.initialField.x = Number(e.target.dataset.x);
    movement.initialField.y = Number(e.target.dataset.y);

    const letter = sel(`.letter[data-x="${movement.initialField.x}"][data-y="${movement.initialField.y}"]`).textContent;

    sel('.word').textContent = letter;
    sel('.word').style.visibility = 'visible';
    isClicked = true;

    drawLine();
});

globalEventListener('mouseover', '.field', e => {
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



/*-----------------------------------
                VARIABLES
 -----------------------------------*/
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
}

const levels = {
    beginner: {
        name: 'beginner',
        columns: 5,
        rows: 8,
        rotate: {
            transformOriginX: '3rem',
            diagonalStep: 126,
            verticalStep: 77.56,
            diagonalLT: -37.8,
            diagonalLB: 37.8,
            diagonalRT: -142.2,
            diagonalRB: 142.2
        }
    },

    easy: {
        name: 'easy',
        columns: 7,
        rows: 11,
        rotate: {
            transformOriginX: '2.15rem',
            diagonalStep: 127.56,
            verticalStep: 79.1,            
            diagonalLT: -38.5,
            diagonalRT: -141.6,
            diagonalLB: 38.5,
            diagonalRB: 141.6
        }
    },

    medium: {
        name: 'medium',
        columns: 9,
        rows: 15,
        rotate: {
            verticalStep: 74.5,
            diagonalStep: 125,
            transformOriginX: '1.7rem',
            diagonalLT: -36.7,
            diagonalRT: -143.2,
            diagonalLB: 36.7,
            diagonalRB: 143.3
        }
    },

    advanced: {
        name: 'advanced',
        columns: 10,
        rows: 16,
        rotate: {
            verticalStep: 77.6,
            diagonalStep: 126.5,
            transformOriginX: '1.52rem',
            diagonalLT: -37.8,
            diagonalRT: -142.2,
            diagonalLB: 37.8,
            diagonalRB: 142.2
        }
    }
}

const lineColors = [
    '#00b7ff79',
    '#ff000079',
    '#00ff0079',
    '#ff00ff79',
    '#ffff0079',
    '#00ffff79'
];

let isClicked = false;
let level = null;
let word = '';



/*---------------------------------
                MAIN
 ---------------------------------*/

(() => {
    let chosenLevel = 'beginner';
    level = levels[chosenLevel];
    buildGameTable(level);
})()