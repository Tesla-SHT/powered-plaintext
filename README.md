# Powered Plain Text

Add semantic highlighting and logical symbol hints to plain text and LaTeX documents for better readability.

## Features

### 🎨 Automatic Syntax Highlighting

- **Logical Transition Words**: Automatically recognize causal, contrastive, progressive relationships
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
- `◆` Summary: in conclusion, finally, 总之, 最后
- `📌` Example: for example, for instance, 例如, 比如
- `①` Sequence: first, second, 首先, 其次

### 📝 Auto-Formatting

Use the command `Rich Text: Auto Format` to automatically insert blank lines at viewpoint transitions.

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

## Requirements

- VS Code 1.85.0 or higher
- Node.js 18 or higher for local development
- npm 9 or higher for local development

## Development Setup

1. Install Node.js 18+ and npm 9+
2. Run `npm install`
3. Run `npm run compile`

If you installed Node.js from your Linux distribution with `apt install nodejs npm`, you may get an outdated Node.js version. In that case, switch to a current LTS release from NodeSource or the official Node.js packages before running the build.

## Release Notes
See `CHANGELOG.md`.