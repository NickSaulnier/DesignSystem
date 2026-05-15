/**
 * Tiny TSX-flavored tokenizer for the DemoCard "Show code" panel.
 *
 * Goals: handle the narrow stylistic range of our gallery demos well — JSX,
 * hooks, lambdas, strings, comments — without pulling in a 30 KB+ highlighter
 * library. Edge cases (TS generics, conditional types, JSX text mixed with
 * expressions) are intentionally treated as `default` rather than mis-tinted.
 */

export type TokenKind =
  | "keyword"
  | "tag"        // JSX element names + Pascal-case identifiers
  | "attr"       // JSX attribute names (name immediately followed by `=`)
  | "string"     // Including template literals; embedded `${...}` is not split
  | "comment"    // `//`, `/* */`, and JSX `{/* */}`
  | "number"
  | "default";

export interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  "const", "let", "var",
  "function", "return", "if", "else", "for", "while", "of", "in", "do",
  "import", "from", "export", "default",
  "new", "async", "await",
  "true", "false", "null", "undefined",
  "typeof", "instanceof", "as",
  "try", "catch", "throw", "finally",
]);

const REACT_HOOKS = /^use[A-Z]/;

/** Tokenize a TSX-flavored snippet into a flat array of tokens. */
export function tokenizeTsx(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  const n = src.length;
  let prevNonWhitespaceTokenKind: TokenKind | null = null;

  const push = (kind: TokenKind, text: string) => {
    if (text.length === 0) return;
    out.push({ kind, text });
    if (text.trim().length > 0) prevNonWhitespaceTokenKind = kind;
  };

  while (i < n) {
    const c  = src[i]!;
    const c2 = src[i + 1];

    // JSX expression comment: {/* … */}
    if (c === "{" && c2 === "/" && src[i + 2] === "*") {
      const end = src.indexOf("*/}", i + 3);
      const stop = end === -1 ? n : end + 3;
      push("comment", src.slice(i, stop));
      i = stop;
      continue;
    }

    // Line comment: // …
    if (c === "/" && c2 === "/") {
      const nl = src.indexOf("\n", i);
      const stop = nl === -1 ? n : nl;
      push("comment", src.slice(i, stop));
      i = stop;
      continue;
    }

    // Block comment: /* … */
    if (c === "/" && c2 === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      push("comment", src.slice(i, stop));
      i = stop;
      continue;
    }

    // String literals (single, double, backtick).
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      let j = i + 1;
      while (j < n) {
        const cj = src[j]!;
        if (cj === "\\") { j += 2; continue; }
        if (cj === quote) { j++; break; }
        // Template-literal embedded expression: consume up to matching `}`.
        // We don't tokenize INSIDE the expression — it stays part of the
        // string token. Good enough for demo strings.
        if (quote === "`" && cj === "$" && src[j + 1] === "{") {
          j += 2;
          let depth = 1;
          while (j < n && depth > 0) {
            if (src[j] === "{") depth++;
            else if (src[j] === "}") depth--;
            j++;
          }
          continue;
        }
        j++;
      }
      push("string", src.slice(i, j));
      i = j;
      continue;
    }

    // JSX tag opening: < followed by letter or `/`. We capture the tag name
    // (with the leading `<` or `</`) as one tag token. Following attributes
    // and the closing `>` are tokenized normally.
    if (c === "<" && c2 !== undefined && (c2 === "/" || /[A-Za-z]/.test(c2))) {
      let j = i + 1;
      if (src[j] === "/") j++;
      while (j < n && /[\w.:-]/.test(src[j]!)) j++;
      push("tag", src.slice(i, j));
      i = j;
      continue;
    }

    // Self-closing tag end `/>` or plain `>`.
    if (c === "/" && c2 === ">") {
      push("tag", "/>");
      i += 2;
      continue;
    }
    if (c === ">") {
      push("tag", ">");
      i++;
      continue;
    }

    // Number literal.
    if (c >= "0" && c <= "9") {
      let j = i + 1;
      while (j < n && /[\d.]/.test(src[j]!)) j++;
      push("number", src.slice(i, j));
      i = j;
      continue;
    }

    // Identifier / keyword / Pascal-case tag / attribute name.
    if (/[A-Za-z_$]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w$]/.test(src[j]!)) j++;
      const text = src.slice(i, j);
      let kind: TokenKind = "default";
      if (KEYWORDS.has(text)) {
        kind = "keyword";
      } else if (REACT_HOOKS.test(text)) {
        kind = "keyword";                    // useState / useEffect / etc.
      } else if (/^[A-Z]/.test(text) && prevNonWhitespaceTokenKind !== "string") {
        kind = "tag";                         // PascalCase identifiers
      } else if (src[j] === "=" && src[j + 1] !== "=" && src[j + 1] !== ">") {
        kind = "attr";                        // attribute name (followed by `=`, not `==` or `=>`)
      }
      push(kind, text);
      i = j;
      continue;
    }

    // Everything else (punctuation, whitespace) — default-tinted, no styling.
    push("default", c);
    i++;
  }

  return out;
}

/**
 * Tokenize then split at newlines so each result is one line's tokens.
 * Returns an array of arrays — one inner array per line of input.
 */
export function tokenizeTsxLines(src: string): Token[][] {
  const tokens = tokenizeTsx(src);
  const lines: Token[][] = [[]];
  for (const tok of tokens) {
    const parts = tok.text.split("\n");
    for (let k = 0; k < parts.length; k++) {
      if (k > 0) lines.push([]);
      const part = parts[k]!;
      if (part.length > 0) lines[lines.length - 1]!.push({ kind: tok.kind, text: part });
    }
  }
  return lines;
}
