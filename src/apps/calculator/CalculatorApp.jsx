import { useEffect, useState } from 'react';

const OPERATORS = ['+', '−', '×', '÷'];

function formatResult(value) {
  if (!Number.isFinite(value)) throw new Error('Invalid result');
  if (Object.is(value, -0)) return '0';
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

/**
 * Small arithmetic parser so calculator input never needs eval()/Function().
 * Supports decimals, parentheses, +, -, ×, ÷ and unary +/-.
 */
function evaluateExpression(input) {
  const expression = input.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-');
  let index = 0;

  const skipSpaces = () => {
    while (/\s/.test(expression[index] ?? '')) index += 1;
  };

  const parseNumber = () => {
    skipSpaces();
    const start = index;
    let dots = 0;

    while (index < expression.length) {
      const char = expression[index];
      if (char === '.') {
        dots += 1;
        if (dots > 1) break;
        index += 1;
      } else if (/\d/.test(char)) {
        index += 1;
      } else {
        break;
      }
    }

    if (start === index || expression.slice(start, index) === '.') {
      throw new Error('Expected number');
    }

    return Number(expression.slice(start, index));
  };

  const parsePrimary = () => {
    skipSpaces();
    const char = expression[index];

    if (char === '+') {
      index += 1;
      return parsePrimary();
    }
    if (char === '-') {
      index += 1;
      return -parsePrimary();
    }
    if (char === '(') {
      index += 1;
      const value = parseAdditive();
      skipSpaces();
      if (expression[index] !== ')') throw new Error('Missing )');
      index += 1;
      return value;
    }

    return parseNumber();
  };

  const parseMultiplicative = () => {
    let value = parsePrimary();

    while (true) {
      skipSpaces();
      const operator = expression[index];
      if (operator !== '*' && operator !== '/') break;
      index += 1;
      const right = parsePrimary();
      if (operator === '*' ) value *= right;
      else {
        if (right === 0) throw new Error('Cannot divide by zero');
        value /= right;
      }
    }

    return value;
  };

  const parseAdditive = () => {
    let value = parseMultiplicative();

    while (true) {
      skipSpaces();
      const operator = expression[index];
      if (operator !== '+' && operator !== '-') break;
      index += 1;
      const right = parseMultiplicative();
      value = operator === '+' ? value + right : value - right;
    }

    return value;
  };

  const result = parseAdditive();
  skipSpaces();
  if (index !== expression.length || !Number.isFinite(result)) throw new Error('Invalid expression');
  return result;
}

export default function CalculatorApp() {
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState('0');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [error, setError] = useState(false);

  const clear = () => {
    setExpression('0');
    setResult('0');
    setJustEvaluated(false);
    setError(false);
  };

  const calculate = (value = expression) => {
    try {
      const next = formatResult(evaluateExpression(value));
      setResult(next);
      setExpression(next);
      setJustEvaluated(true);
      setError(false);
    } catch {
      setResult('Error');
      setError(true);
    }
  };

  const append = (value) => {
    setError(false);
    setJustEvaluated(false);
    setExpression((current) => {
      if (current === '0' && /^\d$/.test(value)) return value;
      return current + value;
    });
  };

  const pressDigit = (digit) => {
    if (justEvaluated) {
      setExpression(digit);
      setResult(digit);
      setJustEvaluated(false);
      return;
    }
    append(digit);
  };

  const pressOperator = (operator) => {
    setError(false);
    setJustEvaluated(false);
    setExpression((current) => {
      if (current === '0') return `0${operator}`;
      if (OPERATORS.includes(current.at(-1))) return `${current.slice(0, -1)}${operator}`;
      return `${current}${operator}`;
    });
  };

  const decimal = () => {
    if (justEvaluated) {
      setExpression('0.');
      setResult('0.');
      setJustEvaluated(false);
      return;
    }

    setExpression((current) => {
      const lastPart = current.split(/[+−×÷]/).at(-1);
      if (lastPart.includes('.')) return current;
      return current === '0' ? '0.' : `${current}.`;
    });
  };

  const toggleSign = () => {
    setError(false);
    setJustEvaluated(false);
    setExpression((current) => {
      if (current === '0') return '−0';
      const match = current.match(/(.*(?:[+−×÷]|^))(-?\d*\.?\d+)$/);
      if (!match) return `−(${current})`;
      const prefix = match[1];
      const number = match[2];
      return `${prefix}${number.startsWith('-') ? number.slice(1) : `−${number}`}`;
    });
  };

  const percent = () => {
    setError(false);
    setJustEvaluated(false);
    setExpression((current) => {
      const match = current.match(/(.*?)([-−+×÷]?)(\d*\.?\d+)$/);
      if (!match) return current;
      const value = Number(match[3]) / 100;
      return `${match[1]}${match[2]}${formatResult(value)}`;
    });
  };

  const backspace = () => {
    if (justEvaluated || error) return clear();
    setExpression((current) => {
      const next = current.slice(0, -1);
      return next || '0';
    });
  };

  const handleKeyDown = (event) => {
    if (event.key >= '0' && event.key <= '9') return pressDigit(event.key);
    if (event.key === '.') return decimal();
    if (event.key === '+') return pressOperator('+');
    if (event.key === '-') return pressOperator('−');
    if (event.key === '*') return pressOperator('×');
    if (event.key === '/') return pressOperator('÷');
    if (event.key === '%') return percent();
    if (event.key === 'Enter' || event.key === '=') return calculate();
    if (event.key === 'Backspace') return backspace();
    if (event.key === 'Escape' || event.key.toLowerCase() === 'c') return clear();
    if (event.key === '(' || event.key === ')') return append(event.key);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const buttons = [
    { label: 'C', action: clear, className: 'bg-os-danger' },
    { label: '⌫', action: backspace },
    { label: '%', action: percent },
    { label: '÷', action: () => pressOperator('÷'), operator: true },
    { label: '7', action: () => pressDigit('7') },
    { label: '8', action: () => pressDigit('8') },
    { label: '9', action: () => pressDigit('9') },
    { label: '×', action: () => pressOperator('×'), operator: true },
    { label: '4', action: () => pressDigit('4') },
    { label: '5', action: () => pressDigit('5') },
    { label: '6', action: () => pressDigit('6') },
    { label: '−', action: () => pressOperator('−'), operator: true },
    { label: '1', action: () => pressDigit('1') },
    { label: '2', action: () => pressDigit('2') },
    { label: '3', action: () => pressDigit('3') },
    { label: '+', action: () => pressOperator('+'), operator: true },
    { label: '±', action: toggleSign },
    { label: '0', action: () => pressDigit('0') },
    { label: '.', action: decimal },
    { label: '=', action: () => calculate(), operator: true, className: 'bg-os-accent text-os-accent-ink' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4 font-mono">
      <div className="min-h-22 rounded-lg border-2 border-os-border-strong bg-os-surface-2 px-3 py-3 text-right shadow-os-window">
        <div className="min-h-5 truncate text-xs text-os-ink-soft">{error ? 'Invalid expression' : expression}</div>
        <div className="mt-1 truncate text-3xl font-semibold text-os-ink">{result}</div>
      </div>

      <div className="grid flex-1 grid-cols-4 gap-2">
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={button.action}
            className={`min-h-10 rounded-lg border-2 border-os-border-strong bg-os-surface px-2 py-2 text-base font-semibold text-os-ink transition-colors hover:bg-os-accent hover:text-os-accent-ink active:scale-[0.98] ${button.operator ? 'font-bold' : ''} ${button.className ?? ''}`}
            aria-label={button.label}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-os-ink-soft">
      </div>
    </div>
  );
}
