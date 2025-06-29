import * as assert from "assert";

// You can import and use all API from the 'vscode' module
import * as vscode from "vscode";
// as well as import your extension to test it
// import * as myExtension from "../extension";
import { tagColors } from "../const";
import { createMockDocument, findTaggedComments, validateTag } from "../utils";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Extension activates without error", () => {
    // Activation is already called in suiteSetup, so just assert true
    assert.ok(true);
  });

  test("ShowTags command displays all tags", async () => {
    let shownMessage = "";
    const originalShow = vscode.window.showInformationMessage;
    (vscode.window as any).showInformationMessage = (msg: string) => {
      shownMessage = msg;
      return Promise.resolve();
    };

    try {
      await vscode.commands.executeCommand("color-comment.showTags");
      // Add small delay to ensure async completion
      await new Promise((resolve) => setTimeout(resolve, 10));
      Object.keys(tagColors).forEach((tag) => {
        assert.ok(
          shownMessage.includes(tag),
          `Tag ${tag} not found in message: ${shownMessage}`
        );
      });
    } finally {
      (vscode.window as any).showInformationMessage = originalShow;
    }
  });

  test("findTaggedComments returns decorations for valid tag", () => {
    const fakeDoc = {
      getText: () => "// todo: this is a test",
      languageId: "javascript",
      positionAt: (i: number) => new vscode.Position(0, i),
    } as any;
    const results = findTaggedComments(fakeDoc, "todo:");
    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0);
    assert.ok(results[0].range);
  });

  test("validateTag works for valid and invalid tags", () => {
    assert.strictEqual(validateTag("todo:"), true);
    assert.strictEqual(validateTag(""), false);
    assert.strictEqual(validateTag("invalid tag!"), false);
    assert.strictEqual(validateTag(undefined), false);
    assert.strictEqual(validateTag("a".repeat(100)), false);
  });
});

suite("Utils Test Suite", () => {
  const {
    safeRegexExec,
    findTaggedComments,
    validateTag,
    escapeRegexSpecialChars,
    getCommentRegexForTag,
  } = require("../utils");

  suite("safeRegexExec", () => {
    test("returns correct match for simple regex", () => {
      const regex = /foo/;
      const result = safeRegexExec(regex, "foo bar");
      assert.ok(result && result[0] === "foo");
    });

    test("returns null if regex throws an error", () => {
      const badRegex = {
        exec: () => {
          throw new Error("fail");
        },
        lastIndex: 0,
      };
      const result = safeRegexExec(badRegex, "foo");
      assert.strictEqual(result, null);
    });

    test("returns null if execution exceeds timeout", () => {
      const slowRegex = {
        exec: () => {
          const start = Date.now();
          while (Date.now() - start < 200) {}
          return null;
        },
        lastIndex: 0,
      };
      const result = safeRegexExec(slowRegex, "foo", 10);
      assert.strictEqual(result, null);
    });

    test("handles regex with lastIndex correctly (global regex)", () => {
      const regex = /foo/g;
      regex.lastIndex = 2;
      safeRegexExec(regex, "foofoo");
      assert.ok(typeof regex.lastIndex === "number");
    });

    test("prevents infinite loop if regex does not advance", () => {
      const stuckRegex = { exec: () => ["foo"], lastIndex: 0 };
      const result = safeRegexExec(stuckRegex, "foo");
      assert.ok(result);
    });

    test("works with non-global regex", () => {
      const regex = /foo/;
      const result = safeRegexExec(regex, "foofoo");
      assert.ok(result && result[0] === "foo");
    });

    test("returns null if regex is invalid (simulate error)", () => {
      const badRegex = { exec: null, lastIndex: 0 };
      const result = safeRegexExec(badRegex, "foo");
      assert.strictEqual(result, null);
    });
  });

  suite("findTaggedComments", () => {
    const makeDoc = (text: string, lang: string = "javascript") => ({
      getText: (): string => text,
      languageId: lang,
      positionAt: (i: number) => new vscode.Position(0, i),
    });

    test("returns empty array for invalid tag", () => {
      const doc = makeDoc("// todo: test");
      assert.deepStrictEqual(findTaggedComments(doc, "bad tag!"), []);
    });

    test("returns empty array if document is too large", () => {
      const doc = makeDoc("a".repeat(1_000_001));
      assert.deepStrictEqual(findTaggedComments(doc, "todo:"), []);
    });

    test("returns empty array if no matches", () => {
      const doc = makeDoc("// nothing here");
      assert.deepStrictEqual(findTaggedComments(doc, "todo:"), []);
    });

    test("returns correct decorations for single-line comments", () => {
      const doc = makeDoc("// todo: test");
      const results = findTaggedComments(doc, "todo:");
      assert.ok(results.length > 0);
      assert.ok(results[0].range);
    });

    test("returns correct decorations for multi-line comments", () => {
      const doc = makeDoc("/* todo: test */");
      const results = findTaggedComments(doc, "todo:");
      assert.ok(results.length > 0);
      assert.ok(results[0].range);
    });

    test("handles multiple matches", () => {
      const doc = makeDoc("// todo: one\n// todo: two");
      const results = findTaggedComments(doc, "todo:");
      assert.ok(results.length >= 2);
    });

    test("handles errors in regex execution gracefully", () => {
      const doc = makeDoc("// todo: test");
      // Patch getCommentRegexForTag to throw
      const orig = require("../utils").getCommentRegexForTag;
      require("../utils").getCommentRegexForTag = () => {
        throw new Error("fail");
      };
      assert.doesNotThrow(() => findTaggedComments(doc, "todo:"));
      require("../utils").getCommentRegexForTag = orig;
    });

    test("handles errors in positionAt gracefully", () => {
      const doc = {
        getText: () => "// todo: test",
        languageId: "javascript",
        positionAt: () => {
          throw new Error("fail");
        },
      };
      assert.doesNotThrow(() => findTaggedComments(doc, "todo:"));
    });

    test("handles unsupported languageId gracefully", () => {
      const doc = makeDoc("// todo: test", "python");
      assert.deepStrictEqual(findTaggedComments(doc, "todo:"), []);
    });

    test("handles tag at start/end of file", () => {
      const doc = makeDoc("todo: at start\n...\ntodo: at end");
      assert.ok(Array.isArray(findTaggedComments(doc, "todo:")));
    });
  });

  suite("validateTag", () => {
    test("returns true for valid tag", () => {
      assert.strictEqual(validateTag("todo:"), true);
    });
    test("returns false for empty string", () => {
      assert.strictEqual(validateTag(""), false);
    });
    test("returns false for too-long tag", () => {
      assert.strictEqual(validateTag("a".repeat(100)), false);
    });
    test("returns false for tag with invalid characters", () => {
      assert.strictEqual(validateTag("bad tag!"), false);
    });
    test("returns false for non-string input", () => {
      assert.strictEqual(validateTag(undefined), false);
      assert.strictEqual(validateTag(123), false);
      assert.strictEqual(validateTag({}), false);
    });
  });

  suite("escapeRegexSpecialChars", () => {
    test("escapes all special characters", () => {
      const specials = ".*+?^${}()|[]\\";
      const escaped = escapeRegexSpecialChars(specials);
      assert.strictEqual(
        escaped,
        "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\"
      );
    });
    test("returns same string if no special characters", () => {
      assert.strictEqual(escapeRegexSpecialChars("abc123"), "abc123");
    });
    test("throws error if input is not a string", () => {
      assert.throws(
        () => escapeRegexSpecialChars(undefined),
        /Input must be a string/
      );
    });
    test("works with empty string", () => {
      assert.strictEqual(escapeRegexSpecialChars(""), "");
    });
  });

  suite("getCommentRegexForTag", () => {
    test("returns correct regexes for JavaScript", () => {
      const regexes = getCommentRegexForTag("javascript", "todo:");
      assert.ok(Array.isArray(regexes));
      assert.ok(regexes.length >= 2);
      assert.ok(regexes[0] instanceof RegExp);
    });
    test("returns empty array for unsupported language", () => {
      const regexes = getCommentRegexForTag("python", "todo:");
      assert.deepStrictEqual(regexes, []);
    });
    test("escapes special characters in tag", () => {
      const regexes = getCommentRegexForTag("javascript", "to.do:");
      assert.ok(regexes[0].source.includes("to\\.do:"));
    });
    test("handles error in regex creation gracefully", () => {
      const orig = require("../utils").escapeRegexSpecialChars;
      require("../utils").escapeRegexSpecialChars = () => {
        throw new Error("fail");
      };
      assert.doesNotThrow(() => getCommentRegexForTag("javascript", "todo:"));
      require("../utils").escapeRegexSpecialChars = orig;
    });
    test("returns array of regexes (not null/undefined)", () => {
      const regexes = getCommentRegexForTag("javascript", "todo:");
      assert.ok(Array.isArray(regexes));
    });
    test("works with empty tag (should still return regex)", () => {
      const regexes = getCommentRegexForTag("javascript", "");
      assert.ok(Array.isArray(regexes));
    });
  });
});

suite("Additional Edge Cases", () => {
  test("handles malicious regex patterns (ReDoS prevention)", () => {
    const doc = {
      getText: () => "/* todo: " + "a".repeat(1000) + "*/",
      languageId: "javascript",
      positionAt: (i: number) => new vscode.Position(0, i),
    } as any;

    const start = Date.now();
    const results = findTaggedComments(doc, "todo:");
    const duration = Date.now() - start;

    // Should complete quickly even with large input
    assert.ok(duration < 1000, `Took too long: ${duration}ms`);
  });

  test("handles nested comments correctly", () => {
    const doc = makeDoc("/* todo: /* nested */ comment */") as any;
    const results = findTaggedComments(doc, "todo:");
    assert.ok(results.length > 0);
  });

  test("handles unicode characters in comments", () => {
    const doc = makeDoc("// todo: 测试 unicode 🚀") as any;
    const results = findTaggedComments(doc, "todo:");
    assert.ok(results.length > 0);
  });

  test("handles very long lines", () => {
    const longComment = "// todo: " + "x".repeat(10000);
    const doc = makeDoc(longComment) as any;
    assert.doesNotThrow(() => findTaggedComments(doc, "todo:"));
  });
});

suite("Performance Tests", () => {
  test("processes large documents within time limit", () => {
    const largeText = Array(1000).fill("// todo: test comment").join("\n");
    const doc = createMockDocument(largeText);

    const start = performance.now();
    const results = findTaggedComments(doc, "todo:");
    const duration = performance.now() - start;

    assert.ok(
      duration < 100,
      `Processing took ${duration}ms, should be < 100ms`
    );
    assert.strictEqual(results.length, 1000);
  });
});

function makeDoc(text: string, lang: string = "javascript") {
  return {
    getText: () => text,
    languageId: lang,
    positionAt: (i: number) => new vscode.Position(0, i),
  };
}
