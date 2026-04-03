# Welcome to Powered Plain Text VS Code Extension

## What's in the folder

* This folder contains the files for the Powered Plain Text extension.
* `package.json` declares the extension metadata, supported language associations, activation events, and grammar injection.
* `syntaxes/richtext.tmLanguage.json` defines the TextMate grammar used for semantic highlighting and LaTeX injection.
* `language-configuration.json` defines the editor behavior for the custom `Rich Text` language mode.

## Get up and running straight away

* Make sure the language configuration settings in `language-configuration.json` are accurate.
* Press `F5` to open a new window with your extension loaded.
* Open a `.txt`, `.rtxt`, or `.rich` file to test the custom `Rich Text` language mode.
* Open a `.tex` or `.latex` file to verify that the extension injects extra highlighting into LaTeX without changing the file's language mode.
* Verify that syntax highlighting and logical symbol hints work as expected.

## Make changes

* You can relaunch the extension from the debug toolbar after making changes to the files listed above.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Install your extension

* To start using your extension with Visual Studio Code copy it into the `<user home>/.vscode/extensions` folder and restart Code.
* To share your extension with the world, read on https://code.visualstudio.com/api/working-with-extensions/publishing-extension about publishing an extension.


## Compile Extension
- Use Node.js 18+ and npm 9+ for local development.
- On Debian or Ubuntu, `apt install nodejs npm` may install an older Node.js that cannot run TypeScript 5.
- If that happens, install a current LTS Node.js release from NodeSource or the official Node.js distribution first: `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -` and `sudo apt install nodejs`.
- `npm install` - Installs the necessary dependencies for the extension after installing npm.
- `npm run compile` - Compiles the extension code using TypeScript compiler.
- `F5` - Launches a new VS Code window with the extension loaded for debugging.

## Generate VSIX
- `npm install -g vsce` - Installs the VS Code Extension Manager globally.
- `vsce package` - Generates a `.vsix` package file for the extension, which can be shared or published to the VS Code Marketplace.
- `Ctrl + Shift + P` and select `Extensions: Install from VSIX...` - Installs the generated `.vsix` package into VS Code for testing or usage.
