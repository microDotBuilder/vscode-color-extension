import { LanguageService } from "../v2/main/language-service";
import { watchLanguages } from "../v2/consts";

// Simple test runner for demonstration
function runTests() {
  console.log("Running LanguageService tests...");

  let passedTests = 0;
  let totalTests = 0;

  function test(name: string, testFn: () => boolean) {
    totalTests++;
    try {
      const result = testFn();
      if (result) {
        console.log(`✅ ${name}`);
        passedTests++;
      } else {
        console.log(`❌ ${name}`);
      }
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error}`);
    }
  }

  // Test getSupportedLanguageIds
  test("getSupportedLanguageIds should return array of supported languages", () => {
    const languages = LanguageService.getSupportedLanguageIds();
    return Array.isArray(languages) && languages.length > 0;
  });

  test("getSupportedLanguageIds should include all watchLanguages", () => {
    const languages = LanguageService.getSupportedLanguageIds();
    const watchLanguageIds = Object.keys(watchLanguages);

    // Check that all languages in watchLanguages are included in supported languages
    return watchLanguageIds.every((languageId) =>
      languages.includes(languageId)
    );
  });

  // Test getLanguageConfig
  test("getLanguageConfig should return config for valid language", () => {
    const config = LanguageService.getLanguageConfig("javascript");
    return (
      config !== null &&
      config.fileExtension === ".js" &&
      config.commentPrefix === "//"
    );
  });

  test("getLanguageConfig should return null for invalid language", () => {
    const config = LanguageService.getLanguageConfig("invalid-language");
    return config === null;
  });

  // Test getCommentPrefixRegex
  test("getCommentPrefixRegex should return regex for valid language", () => {
    const regex = LanguageService.getCommentPrefixRegex("javascript");
    return regex !== null && regex instanceof RegExp;
  });

  test("getCommentPrefixRegex should return null for invalid language", () => {
    const regex = LanguageService.getCommentPrefixRegex("invalid-language");
    return regex === null;
  });

  // Test getCommentPrefix
  test("getCommentPrefix should return prefix for valid language", () => {
    const prefix = LanguageService.getCommentPrefix("javascript");
    return prefix === "//";
  });

  test("getCommentPrefix should return null for invalid language", () => {
    const prefix = LanguageService.getCommentPrefix("invalid-language");
    return prefix === null;
  });

  // Test getFileExtension
  test("getFileExtension should return extension for valid language", () => {
    const extension = LanguageService.getFileExtension("javascript");
    return extension === ".js";
  });

  test("getFileExtension should return null for invalid language", () => {
    const extension = LanguageService.getFileExtension("invalid-language");
    return extension === null;
  });

  // Test getAllLanguageConfigs
  test("getAllLanguageConfigs should return array of configs", () => {
    const configs = LanguageService.getAllLanguageConfigs();
    return Array.isArray(configs) && configs.length > 0;
  });

  test("getAllLanguageConfigs should have valid config structure", () => {
    const configs = LanguageService.getAllLanguageConfigs();
    return configs.every(
      (config) =>
        typeof config.fileExtension === "string" &&
        typeof config.commentPrefix === "string" &&
        config.commentPrefixRegex instanceof RegExp
    );
  });

  console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
}

// Export for use in other test files
export { runTests };
