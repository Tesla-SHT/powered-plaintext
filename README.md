# Powered Plain Text

Add semantic highlighting, logical symbol hints, and configurable writing-aware vocabulary to plain text and LaTeX documents.

## Features

### 🎨 Automatic Syntax Highlighting

- **Logic Words And Sequence Markers**: Dynamically emphasize configured transition words and ordered argument markers
- **Punctuation**: Soft gray display
- **Quoted Content**: String-style highlighting
- **Book Titles**: Highlighted display for books and works
- **Parenthetical Content**: Dimmed display for supplementary notes
- **Numbers**: Eye-catching orange display

### 🔣 Logical Symbol Hints

Logical transition words in text automatically display corresponding symbols (display only, won't be copied):

- `→` Causation: because, since, 因为, 由于
- `⇒` Result: therefore, thus, 因此, 所以
- `⇄` Contrast: but, however, 但是, 然而
- `⊕` Addition: moreover, furthermore, 此外, 并且
- `◆` Summary: in conclusion, in summary, 总之, 综上
- `📌` Example: for example, for instance, 例如, 比如
- `①` Sequence: first, second, 首先, 其次

### ⚙️ Writing Profiles And Custom Vocabulary

- Built-in profiles for `general`, `academic`, `journal`, and `notes`
- User-defined transition words for causation, result, contrast, addition, summary, and examples
- User-defined sequence markers for ordered arguments, outlines, and note structures
- Auto Format can follow your custom paragraph break vocabulary

### 📝 Auto-Formatting

Use the command `Powered Plain Text: Auto Format` to automatically insert blank lines at viewpoint transitions.

## Supported Files

Rich Text language mode associations:
- `.txt`
- `.rtxt`
- `.rich`

LaTeX enhancement support:
- `.tex`
- `.latex`

`.tex` and `.latex` files stay in the `LaTeX` language mode. This extension injects additional highlighting and logical symbol hints into those files instead of replacing the LaTeX language.

## Usage

1. Open a `.txt`, `.rtxt`, `.rich`, `.tex`, or `.latex` file
2. For `.txt`, `.rtxt`, and `.rich`, select `Rich Text` if VS Code did not auto-detect it
3. For `.tex` and `.latex`, keep the file in `LaTeX` mode
4. Start typing and the extension will apply highlighting and symbol hints automatically

## Settings

The extension supports configurable writing profiles and custom word lists in `settings.json`.

Rules for writing the JSON:

- All custom word lists are plain string arrays, not regex patterns
- Single words and multi-word phrases are both supported
- Matching is case-insensitive for English text
- You can provide only the keys you need; missing keys fall back to built-in defaults
- Transition hints are intended for line starts, list items, and sentence or clause boundaries rather than every sentence-internal occurrence

Field-by-field structure:

- `poweredPlaintext.writingProfile`
  Choose one of: `general`, `academic`, `journal`, `notes`
- `poweredPlaintext.enableSymbolHints`
  `true` shows symbols such as `→` and `①`; `false` keeps emphasis coloring without the prepended symbols
- `poweredPlaintext.customTransitionWords`
  An object with optional arrays named `causation`, `result`, `contrast`, `addition`, `summary`, `example`
- `poweredPlaintext.customSequenceWords`
  An object with optional arrays named `starters`, `continuers`, `terminators`
- `poweredPlaintext.autoFormatParagraphBreakWords`
  An array of extra words or phrases that should trigger a blank line before a new paragraph when using Auto Format

Complete example:

```json
{
	"poweredPlaintext.writingProfile": "academic",
	"poweredPlaintext.enableSymbolHints": true,
	"poweredPlaintext.customTransitionWords": {
		"causation": ["given that", "鉴于此"],
		"result": ["as a result", "由此可见"],
		"contrast": ["on the contrary", "相较之下"],
		"addition": ["more importantly", "进一步说"],
		"summary": ["to close", "归根结底"]
	},
	"poweredPlaintext.customSequenceWords": {
		"starters": ["first claim", "研究问题"],
		"continuers": ["next claim", "进一步来看"],
		"terminators": ["final takeaway", "最终结论"]
	},
	"poweredPlaintext.autoFormatParagraphBreakWords": ["to conclude", "for now"]
}
```

Minimal examples:

Only switch profile:

```json
{
	"poweredPlaintext.writingProfile": "notes"
}
```

Only add custom contrast words:

```json
{
	"poweredPlaintext.customTransitionWords": {
		"contrast": ["by comparison", "反过来看"]
	}
}
```

Only tune auto format paragraph breaks:

```json
{
	"poweredPlaintext.autoFormatParagraphBreakWords": ["to conclude", "综上所述"]
}
```

Suggested profiles:

- `general`: balanced defaults for everyday writing
- `academic`: stronger support for formal argumentation and paper-style transitions
- `journal`: better defaults for reflective writing and daily logs
- `notes`: shorthand-friendly defaults for note taking and quick summaries

Recommended usage:

- Put structural discourse markers in `customTransitionWords`, such as `by contrast`, `因此`, `for example`
- Put ordered outline markers in `customSequenceWords`, such as `first claim`, `第二点`, `final takeaway`
- Do not put ordinary sentence-internal adverbs there unless you really want them treated as structural signals

## Requirements

- VS Code 1.85.0 or higher
- Node.js 18 or higher for local development
- npm 9 or higher for local development

## Development Setup

1. Install Node.js 18+ and npm 9+
2. Run `npm install`
3. Run `npm run compile`

If you installed Node.js from your Linux distribution with `apt install nodejs npm`, you may get an outdated Node.js version. In that case, switch to a current LTS release from NodeSource or the official Node.js packages before running the build.

## Positioning

Powered Plain Text is intended for structured writing workflows such as academic drafting, journals, reading notes, meeting notes, and lightweight knowledge management. It is not meant to behave like a programming language grammar.

## Release Notes
See `CHANGELOG.md`.