import { CONFIG } from "./const";
import * as vscode from "vscode";

export function safeRegexExec(
  regex: RegExp,
  text: string,
  timeoutMs: number = CONFIG.REGEX_TIMEOUT_MS
): RegExpExecArray | null {
  const start = Date.now();

  try {
    // Store original lastIndex
    const originalLastIndex = regex.lastIndex;

    const result = regex.exec(text);

    // Check for timeout
    if (Date.now() - start > timeoutMs) {
      console.warn("Regex execution timeout");
      regex.lastIndex = originalLastIndex; // Restore state
      return null;
    }

    // Prevent infinite loop - ensure regex advances
    if (result && regex.lastIndex <= originalLastIndex) {
      regex.lastIndex = originalLastIndex + 1;
    }

    return result;
  } catch (error) {
    console.error("Regex execution error:", error);
    return null;
  }
}

export function findTaggedComments(
  document: vscode.TextDocument,
  tag: string
): vscode.DecorationOptions[] {
  if (!validateTag(tag)) {
    console.warn(`Invalid tag: ${tag}`);
    return [];
  }

  const decorations: vscode.DecorationOptions[] = [];
  const text = document.getText();

  // Additional size check
  if (text.length > CONFIG.MAX_DOCUMENT_SIZE) {
    console.warn("Document too large for decoration processing");
    return [];
  }

  try {
    const regexes = getCommentRegexForTag(document.languageId, tag);

    regexes.forEach((regex, index) => {
      try {
        regex.lastIndex = 0; // Reset regex state
        let match;
        let iterations = 0;

        while (
          (match = safeRegexExec(regex, text)) &&
          iterations < CONFIG.MAX_ITERATIONS
        ) {
          iterations++;

          try {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);

            const decoration: vscode.DecorationOptions = {
              range: new vscode.Range(startPos, endPos),
              hoverMessage: new vscode.MarkdownString(
                `Tagged comment: \`${sanitizeForMarkdown(tag)}\``
              ),
            };

            decorations.push(decoration);
          } catch (positionError) {
            console.error(
              `Error creating decoration for match at index ${match.index}:`,
              positionError
            );
          }
        }

        if (iterations >= CONFIG.MAX_ITERATIONS) {
          console.warn(
            `Max iterations (${CONFIG.MAX_ITERATIONS}) reached for tag: ${tag}, regex: ${index}`
          );
        }
      } catch (regexError) {
        console.error(
          `Error executing regex ${index} for tag ${tag}:`,
          regexError
        );
      }
    });
  } catch (error) {
    console.error(`Error processing tag ${tag}:`, error);
  }

  return decorations;
}

export function validateTag(tag: unknown): tag is string {
  return (
    typeof tag === "string" &&
    tag.length > 0 &&
    tag.length <= CONFIG.MAX_TAG_LENGTH &&
    /^[a-zA-Z0-9_:-]+$/.test(tag) // Only allow safe characters
  );
}

export function escapeRegexSpecialChars(str: string): string {
  if (typeof str !== "string") {
    throw new Error("Input must be a string");
  }
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeForMarkdown(text: string): string {
  if (typeof text !== "string") {
    return "";
  }
  // Escape markdown special characters
  return text.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
}

export function getCommentRegexForTag(
  languageId: string,
  tag: string
): RegExp[] {
  const patterns: RegExp[] = [];

  try {
    const escapedTag = escapeRegexSpecialChars(tag);

    switch (languageId) {
      case "javascript":
      case "typescript":
      case "go":
        // Single line: // tag: comment
        // More restrictive pattern to prevent ReDoS
        patterns.push(
          new RegExp(`\\/\\/\\s*${escapedTag}\\s*[^\\r\\n]*`, "gim")
        );

        // Multi-line: /* tag: comment */ - safer pattern
        patterns.push(
          new RegExp(
            `\\/\\*\\s*${escapedTag}\\s*(?:[^*]|\\*(?!\\/))*\\*\\/`,
            "gim"
          )
        );
        break;

      default:
        console.warn(`Unsupported language: ${languageId}`);
        break;
    }
  } catch (error) {
    console.error(`Error creating regex patterns for tag ${tag}:`, error);
  }

  return patterns;
}

// Better mock helper
export function createMockDocument(
  text: string,
  languageId: string = "javascript"
) {
  return {
    getText: () => text,
    languageId,
    positionAt: (offset: number) => {
      const lines = text.substring(0, offset).split("\n");
      return new vscode.Position(
        lines.length - 1,
        lines[lines.length - 1].length
      );
    },
    fileName: `test.${languageId}`,
    uri: vscode.Uri.file(`/test/file.${languageId}`),
  } as vscode.TextDocument;
}
