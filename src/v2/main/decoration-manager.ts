import * as vscode from "vscode";
import { ColorConfig } from "../config/color-config";
import { logg, loggError } from "../logger/logg";
import { TagFinder, TagMatchInfo } from "./tag-finder";

/**
 * Service class responsible for managing text editor decorations.
 * This class is designed to be easily testable and reusable.
 */
export class DecorationManager {
  // Map to store TextEditorDecorationType objects, keyed by tag.
  private static decorationTypes = new Map<
    string,
    vscode.TextEditorDecorationType
  >();

  // Cache to store decorations for each editor to prevent them from disappearing
  private static decorationCache = new Map<
    string,
    Map<string, vscode.DecorationOptions[]>
  >();

  /**
   * Gets the cache key for an editor
   */
  private static getEditorCacheKey(editor: vscode.TextEditor): string {
    return editor.document.uri.toString();
  }

  /**
   * Gets cached decorations for an editor and decoration type
   */
  private static getCachedDecorations(
    editor: vscode.TextEditor,
    tagKey: string
  ): vscode.DecorationOptions[] {
    const cacheKey = DecorationManager.getEditorCacheKey(editor);
    const editorCache = DecorationManager.decorationCache.get(cacheKey);
    return editorCache?.get(tagKey) || [];
  }

  /**
   * Updates cached decorations for an editor and decoration type
   */
  private static updateCachedDecorations(
    editor: vscode.TextEditor,
    tagKey: string,
    decorations: vscode.DecorationOptions[]
  ): void {
    const cacheKey = DecorationManager.getEditorCacheKey(editor);
    if (!DecorationManager.decorationCache.has(cacheKey)) {
      DecorationManager.decorationCache.set(cacheKey, new Map());
    }
    const editorCache = DecorationManager.decorationCache.get(cacheKey)!;
    editorCache.set(tagKey, decorations);
  }

  /**
   * Clears cached decorations for an editor
   */
  private static clearCachedDecorations(editor: vscode.TextEditor): void {
    const cacheKey = DecorationManager.getEditorCacheKey(editor);
    DecorationManager.decorationCache.delete(cacheKey);
  }

  /**
   * Creates decoration types for all configured tags and stores them in decorationTypes map.
   * This function should be called during extension activation.
   */
  static createDecorationTypes(): void {
    // Clear existing decoration types
    DecorationManager.disposeAllDecorationTypes();

    // Get current tag colors from configuration
    const tagColors = ColorConfig.getColors();

    // Create decoration types for each configured tag
    for (const [tag, color] of Object.entries(tagColors)) {
      try {
        const decorationType = vscode.window.createTextEditorDecorationType({
          color: color,
        });
        DecorationManager.decorationTypes.set(tag, decorationType);
      } catch (error) {
        loggError({
          prefix: "DecorationManager.createDecorationTypes",
          message: `Failed to create decoration type for tag '${tag}': ${error}`,
        });
      }
    }
  }

  /**
   * Disposes all decoration types to prevent memory leaks
   */
  static disposeAllDecorationTypes(): void {
    DecorationManager.decorationTypes.forEach((decType) => {
      decType.dispose();
    });
    DecorationManager.decorationTypes.clear();
  }

  /**
   * Gets a decoration type for a specific tag
   */
  static getDecorationType(
    tag: string
  ): vscode.TextEditorDecorationType | undefined {
    return DecorationManager.decorationTypes.get(tag);
  }

  /**
   * Applies decorations to an editor based on tag matches
   */
  static applyDecorations(
    editor: vscode.TextEditor,
    tagMatches: Map<number, TagMatchInfo[]>
  ): void {
    // Group decorations by tag type
    const decorationsByTagType: Map<string, vscode.DecorationOptions[]> =
      new Map();

    tagMatches.forEach((tagMatchesOnLine: TagMatchInfo[]) => {
      tagMatchesOnLine.forEach((matchInfo: TagMatchInfo) => {
        const decorationTypeKey = matchInfo.tag;
        if (!decorationsByTagType.has(decorationTypeKey)) {
          decorationsByTagType.set(decorationTypeKey, []);
        }
        decorationsByTagType
          .get(decorationTypeKey)
          ?.push({ range: matchInfo.range });
      });
    });

    // Apply all collected decorations to the editor and cache them
    decorationsByTagType.forEach((decorations, tagKey) => {
      const decoType = DecorationManager.getDecorationType(tagKey);
      if (decoType) {
        // Update cache and apply decorations
        DecorationManager.updateCachedDecorations(editor, tagKey, decorations);
        editor.setDecorations(decoType, decorations);
      }
    });
  }

  /**
   * Applies incremental decorations for changed lines only
   */
  static applyIncrementalDecorations(
    editor: vscode.TextEditor,
    changedLines: number[],
    newTagMatches: Map<number, TagMatchInfo[]>
  ): void {
    // Group decorations by tag type
    const decorationsByTagType: Map<string, vscode.DecorationOptions[]> =
      new Map();

    newTagMatches.forEach((tagMatchesOnLine: TagMatchInfo[]) => {
      tagMatchesOnLine.forEach((matchInfo: TagMatchInfo) => {
        const decorationTypeKey = matchInfo.tag;
        if (!decorationsByTagType.has(decorationTypeKey)) {
          decorationsByTagType.set(decorationTypeKey, []);
        }
        decorationsByTagType
          .get(decorationTypeKey)
          ?.push({ range: matchInfo.range });
      });
    });

    // Apply decorations using cache to prevent disappearing
    decorationsByTagType.forEach((decorations, tagKey) => {
      const decoType = DecorationManager.getDecorationType(tagKey);
      if (decoType) {
        // Get existing decorations from cache
        const existingDecorations = DecorationManager.getCachedDecorations(
          editor,
          tagKey
        );

        // Remove decorations from changed lines only
        const filteredDecorations = existingDecorations.filter((deco) => {
          return !changedLines.some(
            (changedLine) =>
              deco.range.start.line === changedLine ||
              deco.range.end.line === changedLine
          );
        });

        // Add new decorations for changed lines
        const updatedDecorations = [...filteredDecorations, ...decorations];

        // Update cache and apply decorations
        DecorationManager.updateCachedDecorations(
          editor,
          tagKey,
          updatedDecorations
        );
        editor.setDecorations(decoType, updatedDecorations);
      }
    });
  }

  /**
   * Clears all decorations for an editor
   */
  static clearAllDecorations(editor: vscode.TextEditor): void {
    DecorationManager.decorationTypes.forEach((decType, tag) => {
      try {
        editor.setDecorations(decType, []);
      } catch (error: any) {
        loggError({
          message: `Failed to clear decorations for tag ${tag}:${error.message}`,
          prefix: "DecorationManager.clearAllDecorations",
        });
      }
    });
  }

  /**
   * Clears cached decorations when a document is closed
   */
  static clearDecorationsForDocument(document: vscode.TextDocument): void {
    // Clear cached decorations directly using document URI
    // This ensures cache is cleared regardless of editor visibility
    const documentUri = document.uri.toString();
    DecorationManager.decorationCache.delete(documentUri);
  }

  /**
   * Gets all decoration types (for testing purposes)
   */
  static getAllDecorationTypes(): Map<string, vscode.TextEditorDecorationType> {
    return new Map(DecorationManager.decorationTypes);
  }

  /**
   * Gets all cached decorations (for testing purposes)
   */
  static getAllCachedDecorations(): Map<
    string,
    Map<string, vscode.DecorationOptions[]>
  > {
    return new Map(DecorationManager.decorationCache);
  }
}
