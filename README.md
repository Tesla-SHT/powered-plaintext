# Powered Plain Text

Powered Plain Text is a VS Code extension for structured plain-text, Markdown, and LaTeX writing. It highlights discourse markers, shows optional logic symbols, and helps you scan notes, drafts, and arguments more easily.

## What It Does

- Highlights transition words, sequence markers, quotes, titles, parenthetical content, and numbers for better readability and structure
- Adds display-only symbol hints such as `→`, `⇒`, `⇄`, `⊕`, `◆`, and `①` before corresponding transition words and sequences
- Includes built-in writing profiles for `general`, `academic`, `journal`, and `notes` styles, with customizable transition and sequence word lists
- Provides the command `Powered Plain Text: Auto Format` to insert blank lines around structural transitions

## Supported Files

Rich Text mode:

- `.txt`
- `.rtxt`
- `.rich`

LaTeX enhancement:

- `.tex`
- `.latex`

Markdown enhancement:

- `.md`

For `.tex` and `.latex`, keep the file in `LaTeX` mode. The extension adds highlighting and symbol hints without replacing the LaTeX language.

For `.md`, keep the file in `Markdown` mode. The extension adds its own hints and highlighting without replacing Markdown's base styling.

## Quick Start
1. Download and install the extension from the VS Code Marketplace.
2. Open a file with a supported extension or create a new file, keeping the language mode as `Rich Text`, `Markdown`, or `LaTeX` as appropriate.
3. Start typing. Highlighting and symbol hints apply automatically.
4. Run `Powered Plain Text: Auto Format` when you want automatic paragraph breaks.

## Settings

Configure the extension in `settings.json`. The main options are:

- `poweredPlaintext.writingProfile`: `general`, `academic`, `journal`, or `notes`
- `poweredPlaintext.enableSymbolHints`: show or hide symbol hints
- `poweredPlaintext.customTransitionWords`: add words for `causation`, `result`, `contrast`, `addition`, `summary`, and `example`
- `poweredPlaintext.customSequenceWords`: add words for `starters`, `continuers`, and `terminators`
- `poweredPlaintext.autoFormatParagraphBreakWords`: extra words that trigger a blank line in Auto Format

Example:

```json
{
	"poweredPlaintext.writingProfile": "notes",
	"poweredPlaintext.enableSymbolHints": true,
	"poweredPlaintext.customTransitionWords": {
		"contrast": ["by comparison", "反过来看"]
	},
	"poweredPlaintext.customSequenceWords": {
		"starters": ["first claim", "第一点"],
		"terminators": ["final takeaway", "最后结论"]
	},
	"poweredPlaintext.autoFormatParagraphBreakWords": ["to conclude", "for now"]
}
```

Minimal example:

```json
{
	"poweredPlaintext.customTransitionWords": {
		"contrast": ["by comparison", "反过来看"]
	}
}
```

Profile guide:

- `general`: balanced defaults for everyday writing
- `academic`: stronger support for formal argumentation and paper-style transitions
- `journal`: better defaults for reflective writing and daily logs
- `notes`: shorthand-friendly defaults for note taking and quick summaries

## Requirements

- VS Code 1.85.0 or higher

## Development
Requires Node.js 18+ and npm 9+ for local development.
```bash
npm install
npm run compile
```

Then press `F5` in VS Code to launch the extension in a new Extension Development Host window and test it in a supported file.


## Release Notes

See `CHANGELOG.md`.