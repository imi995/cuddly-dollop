const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

const state = {
  current: '0',
  stored: null,
  operator: null,
  waitingForSecondValue: false,
  expression: '0',
};

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Erreur';
  const rounded = Number(value.toFixed(10));
  return String(rounded);
}

function updateDisplay() {
  expressionEl.textContent = state.expression || '0';
  resultEl.textContent = state.current || '0';
}

function clearAll() {
  state.current = '0';
  state.stored = null;
  state.operator = null;
  state.waitingForSecondValue = false;
  state.expression = '0';
  updateDisplay();
}

function appendNumber(value) {
  if (state.waitingForSecondValue) {
    state.current = value;
    state.waitingForSecondValue = false;
  } else if (state.current === '0' || state.current === 'Erreur') {
    state.current = value;
  } else {
    state.current += value;
  }

  if (state.operator && state.stored !== null && !state.waitingForSecondValue) {
    state.expression = `${formatNumber(state.stored)} ${state.operator} ${state.current}`;
  } else {
    state.expression = state.current;
  }

  updateDisplay();
}

function appendDecimal() {
  if (state.waitingForSecondValue) {
    state.current = '0.';
    state.waitingForSecondValue = false;
  } else if (!state.current.includes('.')) {
    state.current += '.';
  }

  if (state.operator && state.stored !== null) {
    state.expression = `${formatNumber(state.stored)} ${state.operator} ${state.current}`;
  } else {
    state.expression = state.current;
  }

  updateDisplay();
}

function applyOperator(nextOperator) {
  const inputValue = Number(state.current);

  if (state.operator && state.waitingForSecondValue) {
    state.operator = nextOperator;
    state.expression = `${formatNumber(state.stored)} ${state.operator}`;
    updateDisplay();
    return;
  }

  if (state.stored === null) {
    state.stored = inputValue;
  } else if (!state.waitingForSecondValue) {
    const result = calculate(state.stored, inputValue, state.operator);
    state.current = formatNumber(result);
    state.stored = result;
  }

  state.operator = nextOperator;
  state.waitingForSecondValue = true;
  state.expression = `${formatNumber(state.stored)} ${state.operator}`;
  updateDisplay();
}

function calculate(first, second, operator) {
  switch (operator) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '*':
      return first * second;
    case '/':
      return second === 0 ? Number.NaN : first / second;
    default:
      return second;
  }
}

function equals() {
  if (state.operator === null || state.stored === null) {
    return;
  }

  const result = calculate(state.stored, Number(state.current), state.operator);
  if (!Number.isFinite(result)) {
    state.current = 'Erreur';
    state.expression = 'Erreur';
    state.stored = null;
    state.operator = null;
    state.waitingForSecondValue = false;
    updateDisplay();
    return;
  }

  state.current = formatNumber(result);
  state.expression = state.current;
  state.stored = null;
  state.operator = null;
  state.waitingForSecondValue = false;
  updateDisplay();
}

function toggleSign() {
  const value = Number(state.current);
  if (!Number.isFinite(value)) {
    return;
  }
  state.current = formatNumber(-value);
  state.expression = state.current;
  updateDisplay();
}

function percent() {
  const value = Number(state.current);
  if (!Number.isFinite(value)) {
    return;
  }
  state.current = formatNumber(value / 100);
  state.expression = state.current;
  updateDisplay();
}

function deleteLast() {
  if (state.waitingForSecondValue) {
    state.waitingForSecondValue = false;
    state.expression = formatNumber(state.stored ?? 0);
    state.current = formatNumber(state.stored ?? 0);
    updateDisplay();
    return;
  }

  if (state.current.length <= 1 || state.current === 'Erreur') {
    state.current = '0';
  } else if (state.current.endsWith('.')) {
    state.current = state.current.slice(0, -1);
  } else {
    state.current = state.current.slice(0, -1);
  }

  state.expression = state.current;
  updateDisplay();
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case 'number':
        appendNumber(value);
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'operator':
        applyOperator(value);
        break;
      case 'equals':
        equals();
        break;
      case 'clear':
        clearAll();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'sign':
        toggleSign();
        break;
      case 'percent':
        percent();
        break;
      default:
        break;
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (/^[0-9]$/.test(event.key)) {
    appendNumber(event.key);
  }

  if (event.key === '.') {
    appendDecimal();
  }

  if (['+', '-', '*', '/'].includes(event.key)) {
    applyOperator(event.key);
  }

  if (event.key === 'Enter' || event.key === '=') {
    equals();
  }

  if (event.key === 'Escape') {
    clearAll();
  }

  if (event.key === 'Backspace') {
    deleteLast();
  }
});

updateDisplay();
