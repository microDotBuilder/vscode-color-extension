import * as vscode from "vscode";
import { loggError } from "../logger/logg";
import { watchLanguages } from "../consts";

export interface LanguageConfig {
  fileExtension: string;
  commentPrefix: string;
  commentPrefixRegex: RegExp;
  commentSuffix: string;
}

export interface LanguageInfo {
  languageConfig: LanguageConfig;
  languageId: string;
  lines: string[];
}

/**
 * Service class responsible for language detection and validation.
 * This class is designed to be easily testable and reusable.
 */
export class LanguageService {
  /**
   * Gets language information for a document, including configuration and lines.
   *
   * @param document The text document to analyze
   * @returns LanguageInfo object or null if language is not supported
   */
  static getLanguageInfo(document: vscode.TextDocument): LanguageInfo | null {
    const languageId = document.languageId;

    // Check if this language is in our watchLanguages first
    const languageConfig =
      watchLanguages[languageId as keyof typeof watchLanguages];

    if (!languageConfig) {
      loggError({
        message: `Unsupported language: ${languageId}`,
        prefix: "LanguageService.getLanguageInfo",
      });
      return null;
    }

    // Only split the document text into lines if language is supported
    const lines = document.getText().split("\n");

    return { languageConfig, languageId, lines };
  }

  /**
   * Checks if a document's language is supported by the extension.
   *
   * @param document The text document to check
   * @returns True if the language is supported, false otherwise
   */
  static isLanguageSupported(document: vscode.TextDocument): boolean {
    const languageId = document.languageId;
    return languageId in watchLanguages;
  }

  /**
   * Gets the language configuration for a specific language ID.
   *
   * @param languageId The language ID to get configuration for
   * @returns LanguageConfig object or null if language is not supported
   */
  static getLanguageConfig(languageId: string): LanguageConfig | null {
    const languageConfig =
      watchLanguages[languageId as keyof typeof watchLanguages];
    return languageConfig || null;
  }

  /**
   * Gets all supported language IDs.
   *
   * @returns Array of supported language IDs
   */
  static getSupportedLanguageIds(): string[] {
    return Object.keys(watchLanguages);
  }

  /**
   * Gets all supported language configurations.
   *
   * @returns Array of LanguageConfig objects
   */
  static getAllLanguageConfigs(): LanguageConfig[] {
    return Object.values(watchLanguages);
  }

  /**
   * Validates if a document is suitable for processing (size, language, etc.).
   *
   * @param document The text document to validate
   * @returns True if the document is valid for processing, false otherwise
   */
  static isDocumentValidForProcessing(document: vscode.TextDocument): boolean {
    // Check if language is supported
    if (!LanguageService.isLanguageSupported(document)) {
      return false;
    }

    // Check document size
    const text = document.getText();
    if (text.length > 1000000) {
      // 1MB limit
      loggError({
        message: "Document too large for decoration processing",
        prefix: "LanguageService.isDocumentValidForProcessing",
      });
      return false;
    }

    return true;
  }

  /**
   * Extracts lines from a document with validation.
   *
   * @param document The text document to extract lines from
   * @returns Array of lines or null if document is invalid
   */
  static extractLines(document: vscode.TextDocument): string[] | null {
    if (!LanguageService.isDocumentValidForProcessing(document)) {
      return null;
    }

    return document.getText().split("\n");
  }

  /**
   * Gets the comment prefix regex for a specific language.
   *
   * @param languageId The language ID
   * @returns RegExp object or null if language is not supported
   */
  static getCommentPrefixRegex(languageId: string): RegExp | null {
    const config = LanguageService.getLanguageConfig(languageId);
    return config ? config.commentPrefixRegex : null;
  }

  /**
   * Gets the comment prefix for a specific language.
   *
   * @param languageId The language ID
   * @returns Comment prefix string or null if language is not supported
   */
  static getCommentPrefix(languageId: string): string | null {
    const config = LanguageService.getLanguageConfig(languageId);
    return config ? config.commentPrefix : null;
  }

  /**
   * Gets the file extension for a specific language.
   *
   * @param languageId The language ID
   * @returns File extension string or null if language is not supported
   */
  static getFileExtension(languageId: string): string | null {
    const config = LanguageService.getLanguageConfig(languageId);
    return config ? config.fileExtension : null;
  }
}
