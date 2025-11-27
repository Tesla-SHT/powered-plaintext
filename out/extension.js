"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let transitionDecorationType;
let punctuationDecorationType;
let quotesDecorationType;
let bookTitleDecorationType;
let parenthesesDecorationType;
let numbersDecorationType;
function activate(context) {
    console.log('Rich Text extension activated');
    // 创建装饰类型 - 转折词符号
    transitionDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 4px 0 0',
            fontWeight: 'bold'
        }
    });
    // 标点符号装饰 - 使用灰色，柔和显示
    punctuationDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#888888'
    });
    // 引号内容装饰 - 使用浅绿色 + 斜体
    quotesDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#98C379',
        fontStyle: 'italic'
    });
    // 书名号内容装饰 - 使用浅蓝色 + 中等粗细
    bookTitleDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#61AFEF',
        fontWeight: '500'
    });
    // 括号内容装饰 - 使用浅灰色 + 斜体
    parenthesesDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#5C6370',
        fontStyle: 'italic'
    });
    numbersDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#D19A66'
    });
    // 监听文档变化
    let timeout = undefined;
    const triggerUpdateDecorations = (editor) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => updateDecorations(editor), 100);
    };
    // 初始化当前编辑器
    if (vscode.window.activeTextEditor) {
        triggerUpdateDecorations(vscode.window.activeTextEditor);
    }
    // 监听编辑器切换
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            triggerUpdateDecorations(editor);
        }
    }, null, context.subscriptions);
    // 监听文档内容变化
    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            triggerUpdateDecorations(editor);
        }
    }, null, context.subscriptions);
    // 注册格式化命令
    const formatCommand = vscode.commands.registerCommand('richtext.autoFormat', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'richtext') {
            vscode.window.showWarningMessage('请在 Rich Text 文件中使用此命令');
            return;
        }
        const text = editor.document.getText();
        const lines = text.split('\n');
        const formatted = [];
        for (let i = 0; i < lines.length; i++) {
            formatted.push(lines[i]);
            // 检测观点切换（简单规则：句号后跟转折词）
            if (lines[i].match(/[。.!?]$/) && lines[i + 1]?.match(/^(However|But|然而|但是)/)) {
                formatted.push(''); // 插入空行
            }
        }
        await editor.edit(editBuilder => {
            const fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(text.length));
            editBuilder.replace(fullRange, formatted.join('\n'));
        });
        vscode.window.showInformationMessage('格式化完成');
    });
    context.subscriptions.push(formatCommand);
}
function updateDecorations(editor) {
    if (!editor || editor.document.languageId !== 'richtext') {
        return;
    }
    const text = editor.document.getText();
    const lines = text.split('\n');
    const transitionDecorations = [];
    const punctuationDecorations = [];
    const quotesDecorations = [];
    const bookTitleDecorations = [];
    const parenthesesDecorations = [];
    const numbersDecorations = [];
    // 定义转折词匹配规则
    const transitionPatterns = [
        { regex: /\b([Bb]ecause|[Ss]ince|[Aa]s|[Dd]ue to)\b|因为|由于|既然|鉴于/g, symbol: '→' },
        { regex: /\b([Tt]herefore|[Tt]hus|[Ss]o|[Hh]ence|[Cc]onsequently|[Aa]ccordingly)\b|因此|所以|故而|从而|由此/g, symbol: '⇒' },
        { regex: /\b([Bb]ut|[Hh]owever|[Yy]et|[Aa]lthough|[Tt]hough|[Ww]hile|[Nn]evertheless|[Nn]onetheless|[Oo]n the other hand|[Ii]n contrast|[Cc]onversely)\b|但是|然而|却|不过|虽然|尽管|相反|反之/g, symbol: '⇄' },
        { regex: /\b([Mm]oreover|[Ff]urthermore|[Aa]dditionally|[Aa]lso|[Bb]esides|[Ii]n addition|[Ww]hat's more|[Ll]ikewise|[Ss]imilarly)\b|此外|并且|而且|同时|另外|再者|同样|类似地/g, symbol: '⊕' },
        { regex: /\b([Ii]n conclusion|[Ii]n summary|[Oo]verall|[Ff]inally|[Tt]o sum up|[Ii]n short|[Aa]ll in all)\b|总之|综上|总体来看|最后|总而言之|简而言之/g, symbol: '◆' },
        { regex: /\b([Ff]or example|[Ff]or instance|[Ss]uch as|[Nn]amely|[Ii]ncluding)\b|例如|比如|诸如|包括|譬如/g, symbol: '📌' },
        { regex: /\b([Ff]irst|[Ss]econd|[Tt]hird|[Ff]inally|[Nn]ext|[Tt]hen|[Ll]astly)\b|首先|其次|第三|最后|接着|然后/g, symbol: '①' }
    ];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 1. 转折词符号装饰
        for (const pattern of transitionPatterns) {
            let match;
            pattern.regex.lastIndex = 0;
            while ((match = pattern.regex.exec(line)) !== null) {
                const matchPos = match.index;
                const startPos = new vscode.Position(i, matchPos);
                const decoration = {
                    range: new vscode.Range(startPos, startPos),
                    renderOptions: {
                        before: {
                            contentText: pattern.symbol + ' ',
                            color: new vscode.ThemeColor('editorCodeLens.foreground'),
                            margin: '0 4px 0 0',
                            fontWeight: 'bold'
                        }
                    }
                };
                transitionDecorations.push(decoration);
            }
        }
        // 2. 标点符号装饰
        const punctuationRegex = /[。，、；：！？,.;:!?]/g;
        let punctMatch;
        while ((punctMatch = punctuationRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, punctMatch.index), new vscode.Position(i, punctMatch.index + 1));
            punctuationDecorations.push({ range });
        }
        // 3. 引号内容装饰 (双引号 "..." 和单引号 '...')
        const quoteRegex = /"([^"]*)"|'([^']*)'/g;
        let quoteMatch;
        while ((quoteMatch = quoteRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, quoteMatch.index), new vscode.Position(i, quoteMatch.index + quoteMatch[0].length));
            quotesDecorations.push({ range });
        }
        // 4. 书名号内容装饰 《...》
        const bookTitleRegex = /《([^》]*)》/g;
        let bookMatch;
        while ((bookMatch = bookTitleRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, bookMatch.index), new vscode.Position(i, bookMatch.index + bookMatch[0].length));
            bookTitleDecorations.push({ range });
        }
        // 5. 括号内容装饰 (...)、【...】、[...]
        const parenthesesRegex = /\([^)]*\)|【[^】]*】|\[[^\]]*\]|（[^）]*）/g;
        let parenMatch;
        while ((parenMatch = parenthesesRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, parenMatch.index), new vscode.Position(i, parenMatch.index + parenMatch[0].length));
            parenthesesDecorations.push({ range });
        }
        // 6. 数字装饰
        const numbersRegex = /\b\d+(\.\d+)?%?\b|[一二三四五六七八九十百千万]+[个条项点]?/g;
        let numMatch;
        while ((numMatch = numbersRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, numMatch.index), new vscode.Position(i, numMatch.index + numMatch[0].length));
            numbersDecorations.push({ range });
        }
    }
    // 应用所有装饰
    editor.setDecorations(transitionDecorationType, transitionDecorations);
    editor.setDecorations(punctuationDecorationType, punctuationDecorations);
    editor.setDecorations(quotesDecorationType, quotesDecorations);
    editor.setDecorations(bookTitleDecorationType, bookTitleDecorations);
    editor.setDecorations(parenthesesDecorationType, parenthesesDecorations);
    editor.setDecorations(numbersDecorationType, numbersDecorations);
}
function deactivate() {
    if (transitionDecorationType)
        transitionDecorationType.dispose();
    if (punctuationDecorationType)
        punctuationDecorationType.dispose();
    if (quotesDecorationType)
        quotesDecorationType.dispose();
    if (bookTitleDecorationType)
        bookTitleDecorationType.dispose();
    if (parenthesesDecorationType)
        parenthesesDecorationType.dispose();
    if (numbersDecorationType)
        numbersDecorationType.dispose();
}
//# sourceMappingURL=extension.js.map