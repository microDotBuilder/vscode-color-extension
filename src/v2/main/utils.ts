import * as vscode from "vscode";
import { loggError } from "../logger/logg";
import { CONFIG, watchLanguages } from "../consts";
import { ColorConfig } from "../config/color-config";
import { TagFinder } from "./tag-finder";
import { DecorationManager } from "./decoration-manager";
import { LanguageService } from "./language-service";

/**
 * Clears all existing decorations for an editor.
 * This is a utility function for manual decoration clearing.
 */
export function clearAllExistingDecorations(editor: vscode.TextEditor) {
  DecorationManager.clearAllDecorations(editor);
}

/**
 * Finds tagged comments for a specific tag in a document.
 * This is a utility function for finding decorations for a specific tag.
 */
export function findTaggedComments(
  document: vscode.TextDocument,
  tag: string
): vscode.DecorationOptions[] {
  if (!TagFinder.isSupportedTag(tag)) {
    return [];
  }

  const decorations: vscode.DecorationOptions[] = [];
  const text = document.getText();

  // Additional size check
  if (text.length > CONFIG.MAX_DOCUMENT_SIZE) {
    loggError({
      message: "Document too large for decoration processing",
    });
    return [];
  }

  // Get language info using LanguageService
  const languageInfo = LanguageService.getLanguageInfo(document);
  if (!languageInfo) {
    return [];
  }

  const { languageConfig, lines } = languageInfo;

  // Find tags in lines using the appropriate comment prefix regex
  const tagMatches = TagFinder.findTagsInLines(
    lines,
    languageConfig.commentPrefixRegex
  );

  // Convert to decoration options
  tagMatches.forEach((matchesOnLine) => {
    matchesOnLine.forEach((match) => {
      if (match.tag === tag) {
        decorations.push({ range: match.range });
      }
    });
  });

  return decorations;
}

/**
 * Validates if a tag is supported by checking if it exists in the current configuration.
 * This is a utility function that delegates to TagFinder.
 */
export function isSupportedTag(tag: string): boolean {
  return TagFinder.isSupportedTag(tag);
}

/**
 * Validates a tag string format.
 * This is a utility function that delegates to TagFinder.
 */
export function validateTag(tag: string): boolean {
  return TagFinder.validateTag(tag);
}

/**
 * Checks if a language is supported by checking if it exists in the watchLanguages constant.
 * This utility function uses the dynamic watchLanguages source instead of hardcoded arrays.
 *
 * @param languageId The language ID to check
 * @returns True if the language is supported, false otherwise
 */
export function isLanguageSupported(languageId: string): boolean {
  return languageId in watchLanguages;
}

// Export interfaces for backward compatibility
export interface TagMatchInfo {
  tag: string;
  range: vscode.Range;
  color: string;
}

// Re-export from tag-finder for backward compatibility
export { TagFinder } from "./tag-finder";
