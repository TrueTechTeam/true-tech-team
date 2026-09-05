// Fast path: pull a ```<fenceTag> ... ``` fenced block out of the text.
export function extractFencedJSON(text: string, fenceTag: string): string | null {
  const pattern = new RegExp(`\`\`\`${fenceTag}\\s*([\\s\\S]*?)\`\`\``);
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

// Trailing-comma repair — the most common LLM JSON quirk.
export function repairJSON(raw: string): string {
  return raw.replace(/,(\s*[}\]])/g, '$1');
}

// Walk the text tracking balanced braces/brackets (respecting strings) to
// find the outermost JSON value. More resilient than a fence-regex match to
// truncated fences or prose surrounding the JSON.
export function extractBalancedJSON(text: string): string | null {
  for (let i = 0; i < text.length; i++) {
    const opener = text[i];
    if (opener !== '{' && opener !== '[') {
      continue;
    }
    const closer = opener === '{' ? '}' : ']';

    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;

    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (esc) {
        esc = false;
        continue;
      }
      if (c === '\\' && inStr) {
        esc = true;
        continue;
      }
      if (c === '"') {
        inStr = !inStr;
        continue;
      }
      if (inStr) {
        continue;
      }
      if (c === opener) {
        depth++;
      } else if (c === closer) {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }

    if (end <= i) {
      continue;
    }
    const candidate = text.slice(i, end + 1);
    for (const s of [candidate, repairJSON(candidate)]) {
      try {
        JSON.parse(s);
        return s;
      } catch {
        // try the next candidate
      }
    }
  }
  return null;
}

export function extractAndParseJSON<T>(text: string, fenceTag: string): T {
  const fenced = extractFencedJSON(text, fenceTag);
  if (fenced) {
    try {
      return JSON.parse(fenced) as T;
    } catch {
      try {
        return JSON.parse(repairJSON(fenced)) as T;
      } catch {
        // fall through to balanced extraction
      }
    }
  }

  const balanced = extractBalancedJSON(text);
  if (balanced) {
    return JSON.parse(balanced) as T;
  }

  throw new Error(`Could not extract a "${fenceTag}" JSON block from the agent's response.`);
}
