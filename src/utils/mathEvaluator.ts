/**
 * Safe, highly capable scientific calculator expression evaluator.
 * Supports implicit multiplication, common scientific operations, DEG/RAD toggling,
 * mathematical constants, and variable mappings (for graphing bounds).
 */

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
};

// Normalize and pre-process string for structural tokenization
export function preprocessExpression(expr: string): string {
  let cleaned = expr
    .replace(/\s+/g, "") // remove all whitespace
    .toLowerCase()
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");

  // Handle implicit multiplication (e.g. 2pi => 2*pi, 2(x+1) => 2*(x+1), x sin(x) => x*sin(x))
  // Look for sequence: [digit or pi or e or x or closing brace] followed by [letter or opening brace or x or pi or e]
  const pattern = /(\d+|pi|π|e|x|\))([a-zπθ\(x]|$)/;
  
  // A safe procedural way to insert '*' where necessary
  let lastText = "";
  while (cleaned !== lastText) {
    lastText = cleaned;
    
    // Replace numbers preceding variables or functions: e.g., 2pi -> 2*pi, 3x -> 3*x, 5sin -> 5*sin, 3(4) -> 3*(4)
    cleaned = cleaned.replace(/(\d+)(pi|π|e|x|sin|cos|tan|asin|acos|atan|arcsin|arccos|arctan|ln|log|sqrt|abs|\()/g, "$1*$2");
    
    // Replace pi or e or x preceding brackets or other variables: e.g., pi(x) -> pi*(x), x sin(x) -> x*sin(x), x(x) -> x*(x)
    cleaned = cleaned.replace(/(pi|π|e|x)(\(|sin|cos|tan|asin|acos|atan|arcsin|arccos|arctan|ln|log|sqrt|abs)/g, "$1*$2");
    
    // Replace closing brackets preceding numbers, letters or opening brackets: e.g., (2)(3) -> (2)*(3), (x)5 -> (x)*5, (x)sin(x) -> (x)*sin(x)
    cleaned = cleaned.replace(/\)([\d\w\(piπex])/g, ")*$1");
  }

  return cleaned;
}

/**
 * Tokenizes the standardized mathematical expression
 */
type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'FUNCTION' | 'VARIABLE';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(expr: string, allowedVars: string[] = ['x']): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const funcList = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'arcsin', 'arccos', 'arctan', 'sqrt', 'ln', 'log', 'abs'];

  while (i < expr.length) {
    const char = expr[i];

    // Numbers (including decimals)
    if (/\d/.test(char) || char === '.') {
      let numStr = "";
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Basic operators
    if (['+', '-', '*', '/', '%', '^'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    // Brackets
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Alphabetic tokens (functions, constants, or variables)
    if (/[a-zπ]/i.test(char)) {
      let word = "";
      while (i < expr.length && /[a-zπ0-9]/i.test(expr[i])) {
        word += expr[i];
        i++;
      }

      if (funcList.includes(word)) {
        tokens.push({ type: 'FUNCTION', value: word });
      } else if (allowedVars.includes(word)) {
        tokens.push({ type: 'VARIABLE', value: word });
      } else if (CONSTANTS[word] !== undefined) {
        tokens.push({ type: 'NUMBER', value: CONSTANTS[word].toString() });
      } else {
        // Fallback or potential implicit variable
        tokens.push({ type: 'VARIABLE', value: word });
      }
      continue;
    }

    // Unknown characters skip
    i++;
  }

  return tokens;
}

/**
 * Evaluates the token list using standard binary operation precedence
 */
export function evaluateExpression(
  expressionStr: string,
  variables: Record<string, number> = {},
  isRad = false
): number {
  const preprocessed = preprocessExpression(expressionStr);
  const targetVars = Object.keys(variables);
  const tokens = tokenize(preprocessed, targetVars);

  if (tokens.length === 0) return 0;

  // Implements standard Shunting-Yard parser to create an execution AST or direct stack solver
  let tokenIndex = 0;

  function parsePrimary(): number {
    if (tokenIndex >= tokens.length) {
      throw new Error("Unexpected end of expression");
    }

    const token = tokens[tokenIndex];

    if (token.type === 'NUMBER') {
      tokenIndex++;
      return parseFloat(token.value);
    }

    if (token.type === 'VARIABLE') {
      tokenIndex++;
      const val = variables[token.value];
      if (val === undefined) {
        throw new Error(`Variable '${token.value}' is not defined`);
      }
      return val;
    }

    // Unary plus or minus
    if (token.type === 'OPERATOR' && (token.value === '-' || token.value === '+')) {
      tokenIndex++;
      const right = parsePrimary();
      return token.value === '-' ? -right : right;
    }

    // Nesting parenthesis
    if (token.type === 'LPAREN') {
      tokenIndex++; // eat '('
      const result = parseExpression(0);
      if (tokenIndex >= tokens.length || tokens[tokenIndex].type !== 'RPAREN') {
        throw new Error("Missing closing parenthesis");
      }
      tokenIndex++; // eat ')'
      return result;
    }

    // Function calls: sin(x), sqrt(16)
    if (token.type === 'FUNCTION') {
      const funcName = token.value;
      tokenIndex++; // eat function token
      
      if (tokenIndex >= tokens.length || tokens[tokenIndex].type !== 'LPAREN') {
        throw new Error(`Function '${funcName}' requires parenthesis, e.g. ${funcName}(x)`);
      }
      tokenIndex++; // eat '('
      
      const argument = parseExpression(0);
      
      if (tokenIndex >= tokens.length || tokens[tokenIndex].type !== 'RPAREN') {
        throw new Error(`Missing closing parenthesis for function '${funcName}'`);
      }
      tokenIndex++; // eat ')'

      // Solve scientific operation (Trigonometric degrees vs radians safety boundary)
      switch (funcName) {
        case 'sin':
          return Math.sin(isRad ? argument : (argument * Math.PI) / 180);
        case 'cos':
          return Math.cos(isRad ? argument : (argument * Math.PI) / 180);
        case 'tan':
          return Math.tan(isRad ? argument : (argument * Math.PI) / 180);
        case 'asin':
        case 'arcsin': {
          const res = Math.asin(argument);
          return isRad ? res : (res * 180) / Math.PI;
        }
        case 'acos':
        case 'arccos': {
          const res = Math.acos(argument);
          return isRad ? res : (res * 180) / Math.PI;
        }
        case 'atan':
        case 'arctan': {
          const res = Math.atan(argument);
          return isRad ? res : (res * 180) / Math.PI;
        }
        case 'sqrt':
          if (argument < 0) {
            throw new Error("Imaginary numbers not supported (sqrt of negative)");
          }
          return Math.sqrt(argument);
        case 'ln':
          if (argument <= 0) {
            throw new Error("Domain error: ln limit <= 0");
          }
          return Math.log(argument);
        case 'log':
          if (argument <= 0) {
            throw new Error("Domain error: log limit <= 0");
          }
          return Math.log10(argument);
        case 'abs':
          return Math.abs(argument);
        default:
          throw new Error(`Unsupported function '${funcName}'`);
      }
    }

    throw new Error(`Unexpected token "${token.value}"`);
  }

  // Precedence specification
  const PRECEDENCE: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '^': 3,
  };

  function parseExpression(minPrecedence: number): number {
    let left = parsePrimary();

    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      if (token.type !== 'OPERATOR' || PRECEDENCE[token.value] < minPrecedence) {
        break;
      }

      const op = token.value;
      const opPrecedence = PRECEDENCE[op];
      tokenIndex++; // eat operator

      // Exponentiation is right-associative, others are left-associative
      const nextMinPrecedence = op === '^' ? opPrecedence : opPrecedence + 1;
      const right = parseExpression(nextMinPrecedence);

      if (op === '+') left = left + right;
      else if (op === '-') left = left - right;
      else if (op === '*') left = left * right;
      else if (op === '/') {
        if (right === 0) {
          throw new Error("Division by zero");
        }
        left = left / right;
      } else if (op === '%') left = left % right;
      else if (op === '^') left = Math.pow(left, right);
    }

    return left;
  }

  const finalResult = parseExpression(0);
  if (tokenIndex < tokens.length) {
    throw new Error(`Unexpected mathematical trails at "${tokens[tokenIndex].value}"`);
  }

  return finalResult;
}
