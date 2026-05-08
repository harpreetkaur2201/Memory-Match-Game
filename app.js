// app.js
// MITT Match game logic

let shuffle = function(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

// ----- Game variables -----

const cardsContainer = document.getElementById('cards');
const cardNodes = Array.from(document.querySelectorAll('#cards .card'));
const scoreEl = document.getElementById('score');
const restartBtn = document.querySelector('.restart');
const nextCardEl = document.getElementById('next-card');

let moves = 0;
let matchedCount = 0;
let lockBoard = false;
let currentTarget = null;
let deckOrder = [];

const ICON_LIST = [
  'fa-atom',
  'fa-frog',
  'fa-feather-alt',
  'fa-cogs',
  'fa-anchor',
  'fa-fan'
];

// ----- Build Deck -----

function buildDeck() {
  deckOrder = ICON_LIST.concat(ICON_LIST);
  deckOrder = shuffle(deckOrder);

  cardNodes.forEach((cardEl, index) => {
    const iconClass = deckOrder[index];

    cardEl.dataset.icon = iconClass;

    let iEl = cardEl.querySelector('i');

    if (!iEl) {
      iEl = document.createElement('i');
      cardEl.appendChild(iEl);
    }

    iEl.className = `fas ${iconClass}`;

    cardEl.classList.remove('show', 'matched');
  });

  moves = 0;
  matchedCount = 0;

  updateMovesDisplay();
  chooseNewTarget();
}

// ----- Remaining icons -----

function getRemainingUniqueIcons() {
  const remaining = new Set();

  cardNodes.forEach(card => {
    if (!card.classList.contains('matched')) {
      remaining.add(card.dataset.icon);
    }
  });

  return Array.from(remaining);
}

// ----- Choose next target -----

function chooseNewTarget() {
  const remainingIcons = getRemainingUniqueIcons();

  if (remainingIcons.length === 0) {
    currentTarget = null;
    nextCardEl.innerHTML = '';
    return;
  }

  const idx = Math.floor(Math.random() * remainingIcons.length);

  currentTarget = remainingIcons[idx];

  updateNextCardPreview();
}

// ----- Update next card -----

function updateNextCardPreview() {
  if (!currentTarget) {
    nextCardEl.innerHTML = '';
    return;
  }

  nextCardEl.innerHTML = `
    <i class="fas ${currentTarget}"></i>
  `;
}

// ----- Score display -----

function updateMovesDisplay() {
  scoreEl.textContent = moves;
}

// ----- Card click -----

function onCardClick(e) {
  const clickedCard = e.currentTarget;

  if (
    lockBoard ||
    clickedCard.classList.contains('matched') ||
    clickedCard.classList.contains('show')
  ) {
    return;
  }

  clickedCard.classList.add('show');

  moves += 1;
  updateMovesDisplay();

  if (!currentTarget) {
    chooseNewTarget();
  }

  // Correct match
  if (clickedCard.dataset.icon === currentTarget) {
    lockBoard = true;

    setTimeout(() => {
      clickedCard.classList.add('matched');

      matchedCount += 1;

      // WIN
      if (matchedCount === cardNodes.length) {
        currentTarget = null;
        updateNextCardPreview();

        setTimeout(() => {
          showWinPopup();
        }, 300);

        lockBoard = false;
        return;
      }

      chooseNewTarget();

      lockBoard = false;
    }, 150);

  } else {
    // Wrong card
    lockBoard = true;

    setTimeout(() => {
      clickedCard.classList.remove('show');

      lockBoard = false;
    }, 700);
  }
}

// ----- Restart Game -----

function restartGame() {
  const popup = document.querySelector('.win-popup');

  if (popup) {
    popup.remove();
  }

  cardNodes.forEach(card => {
    card.classList.remove('show', 'matched');
  });

  moves = 0;
  matchedCount = 0;
  lockBoard = false;

  buildDeck();
}

// ----- Win Popup -----

function showWinPopup() {
  const popup = document.createElement('div');

  popup.className = 'win-popup';

  popup.innerHTML = `
    <div class="popup-content">
<div class="celebration-icons">
  <i class="fas fa-trophy"></i>
  <i class="fas fa-star"></i>
  <i class="fas fa-medal"></i>
</div>
      <h2>Congratulations!</h2>

      <p>You completed the Memory Match game.</p>

      <p class="moves-text">
        Total Moves: ${moves}
      </p>

      <button id="play-again-btn">
        Play Again
      </button>
    </div>
  `;

  document.body.appendChild(popup);

  const playAgainBtn = document.getElementById('play-again-btn');

  playAgainBtn.addEventListener('click', () => {
    popup.remove();
    restartGame();
  });
}

// ----- Event Listeners -----

function attachListeners() {
  cardNodes.forEach(card => {
    card.removeEventListener('click', onCardClick);
    card.addEventListener('click', onCardClick);
  });

  restartBtn.removeEventListener('click', restartGame);
  restartBtn.addEventListener('click', restartGame);
}

// ----- Initialize -----

document.addEventListener('DOMContentLoaded', () => {
  buildDeck();
  attachListeners();
});