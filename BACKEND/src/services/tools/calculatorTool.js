import { evaluate } from "mathjs";

export async function evaluateExpression({ expression }) {
    try {
        const result = evaluate(expression);
        return JSON.stringify({ expression, result });
    } catch (err) {
        return JSON.stringify({ expression, error: `Could not evaluate expression: ${err.message}` });
    }
}
