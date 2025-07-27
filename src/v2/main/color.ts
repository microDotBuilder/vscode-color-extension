import * as vscode from "vscode";
import { LanguageService } from "./language-service";
import { TagFinder, TagMatchInfo } from "./tag-finder";
import { DecorationManager } from "./decoration-manager";

/**
 * Applies color decorations to tagged comments in the given text editor.
 * This function uses the new service classes for better separation of concerns.
 *
 * @param editor The `vscode.TextEditor` to apply decorations to.
 * @param changedLines Optional array of line numbers that changed (for incremental updates)
 */
export function colorComment(
  editor: vscode.TextEditor,
  changedLines?: number[]
) {
  const languageInfo = LanguageService.getLanguageInfo(editor.document);
  if (!languageInfo) {
    return; // Silently skip unsupported languages
  }

  const { languageConfig, lines } = languageInfo;

  // If specific lines changed, only process those lines for better performance
  if (changedLines && changedLines.length > 0) {
    // Process only changed lines
    const newTagMatches = TagFinder.findTagsInSpecificLines(
      lines,
      changedLines,
      languageConfig.commentPrefixRegex
    );

    // Apply incremental decorations
    DecorationManager.applyIncrementalDecorations(
      editor,
      changedLines,
      newTagMatches
    );
    return;
  }

  // Full document processing (for initial load or when no specific lines provided)
  const tagMatches = TagFinder.findTagsInLines(
    lines,
    languageConfig.commentPrefixRegex
  );

  // Apply decorations using the decoration manager
  DecorationManager.applyDecorations(editor, tagMatches);
}

/**
 * Creates decoration types for all configured tags.
 * This function should be called during extension activation.
 */
export function createDecorationTypes(): void {
  DecorationManager.createDecorationTypes();
}

/**
 * Clears cached decorations when a document is closed.
 */
export function clearDecorationsForDocument(
  document: vscode.TextDocument
): void {
  DecorationManager.clearDecorationsForDocument(document);
}

/**
 * Disposes all decoration types to prevent memory leaks.
 */
export function disposeAllDecorationTypes(): void {
  DecorationManager.disposeAllDecorationTypes();
}

/**
 * Gets all decoration types (for testing purposes).
 */
export function getAllDecorationTypes(): Map<
  string,
  vscode.TextEditorDecorationType
> {
  return DecorationManager.getAllDecorationTypes();
}

/**
 * Gets all cached decorations (for testing purposes).
 */
export function getAllCachedDecorations(): Map<
  string,
  Map<string, vscode.DecorationOptions[]>
> {
  return DecorationManager.getAllCachedDecorations();
}
