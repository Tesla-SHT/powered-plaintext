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
let sequenceState = {
    counter: 0,
    lastLineNumber: -1,
    lastIndentLevel: 0
};
function activate(context) {
    console.log('Rich Text extension activated');
    // 转折词符号装饰
    transitionDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 4px 0 0',
            fontWeight: 'bold'
        }
    });
    // 标点符号装饰 - 使用主题颜色或灰色
    punctuationDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#888888',
        opacity: '0.6' // 添加透明度,更柔和
    });
    // 引号内容装饰 - 使用字符串颜色
    quotesDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#98C379',
        fontStyle: 'italic'
    });
    // 书名号内容装饰 - 使用类型名颜色
    bookTitleDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#61AFEF',
        fontWeight: '500'
    });
    // 括号内容装饰 - 使用注释颜色
    parenthesesDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#5C6370',
        fontStyle: 'italic'
    });
    // 数字装饰 - 使用数字颜色
    numbersDecorationType = vscode.window.createTextEditorDecorationType({
        color: '#D19A66',
        fontWeight: '500'
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
    // 定义序列词匹配规则 (分类更细致)
    const sequencePatterns = {
        starters: {
            regex: /\b([Ff]irst(ly)?|[Ii]nitially|[Tt]o begin with)\b|首先|第一/g,
            isStarter: true
        },
        continuers: {
            regex: /\b([Ss]econd(ly)?|[Tt]hird(ly)?|[Nn]ext|[Tt]hen|[Aa]fter that|[Mm]oreover)\b|其次|第二|第三|然后|接着|再次/g,
            isStarter: false
        },
        terminators: {
            regex: /\b([Ff]inally|[Ll]astly|[Ii]n the end)\b|最后|终于/g,
            isTerminator: true
        }
    };
    // 其他转折词 (不参与序列计数)
    const transitionPatterns = [
        { regex: /\b([Bb]ecause|[Ss]ince|[Aa]s|[Dd]ue to)\b|因为|由于|既然|鉴于/g, symbol: '→' },
        { regex: /\b([Tt]herefore|[Tt]hus|[Ss]o|[Hh]ence|[Cc]onsequently|[Aa]ccordingly)\b|因此|所以|故而|从而|由此/g, symbol: '⇒' },
        { regex: /\b([Bb]ut|[Hh]owever|[Yy]et|[Aa]lthough|[Tt]hough|[Ww]hile|[Nn]evertheless|[Nn]onetheless|[Oo]n the other hand|[Ii]n contrast|[Cc]onversely)\b|但是|然而|却|不过|虽然|尽管|相反|反之/g, symbol: '⇄' },
        { regex: /\b([Mm]oreover|[Ff]urthermore|[Aa]dditionally|[Aa]lso|[Bb]esides|[Ii]n addition|[Ww]hat's more|[Ll]ikewise|[Ss]imilarly)\b|此外|并且|而且|同时|另外|再者|同样|类似地/g, symbol: '⊕' },
        { regex: /\b([Ii]n conclusion|[Ii]n summary|[Oo]verall|[Tt]o sum up|[Ii]n short|[Aa]ll in all)\b|总之|综上|总体来看|总而言之|简而言之/g, symbol: '◆' },
        { regex: /\b([Ff]or example|[Ff]or instance|[Ss]uch as|[Nn]amely|[Ii]ncluding)\b|例如|比如|诸如|包括|譬如/g, symbol: '📌' }
    ];
    // 辅助函数: 判断是否应该重置计数器
    function shouldResetCounter(currentLine, currentIndent) {
        // 1. 首次运行
        if (sequenceState.lastLineNumber === -1) {
            return true;
        }
        // 2. 行号间隔超过2行 (中间有空行)
        const lineGap = currentLine - sequenceState.lastLineNumber;
        if (lineGap > 2) {
            return true;
        }
        // 3. 缩进层级变化 (可能是新的列表)
        if (Math.abs(currentIndent - sequenceState.lastIndentLevel) > 2) {
            return true;
        }
        return false;
    }
    // 辅助函数: 获取缩进层级
    function getIndentLevel(line) {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }
    // 辅助函数: 判断是否在有效位置 (句首/句号后)
    function isValidSequencePosition(line, matchIndex, matchedWord) {
        // 1. 句首 (前面只有空格/缩进)
        const beforeText = line.substring(0, matchIndex).trim();
        // 2. 检查后面的词,排除名词短语
        const afterMatch = line.substring(matchIndex + matchedWord.length).trim();
        const nounIndicators = [
            'place', 'time', 'step', 'thing', 'person', 'day', 'year',
            'grade', 'prize', 'attempt', 'impression', 'name', 'class',
            '名', '次', '位', '等', '奖', '课', '名次', '名额'
        ];
        // 如果后面紧跟名词指示词,不是序列词
        for (const indicator of nounIndicators) {
            if (afterMatch.toLowerCase().startsWith(indicator)) {
                return false;
            }
        }
        // 3. 检查前面是否有冠词/限定词
        const articlePattern = /\b(the|a|an|this|that|my|your|his|her)\s+$/i;
        if (articlePattern.test(beforeText)) {
            return false;
        }
        // 4. 句首检查
        if (beforeText === '') {
            // 额外检查:如果是句首,后面必须跟逗号或句号,才是序列词
            const hasProperPunctuation = /^[,，.。:：]/.test(afterMatch) ||
                /^ly\b/.test(afterMatch); // firstly
            if (!hasProperPunctuation && afterMatch.length > 0) {
                // 进一步检查是否为名词短语
                return !nounIndicators.some(noun => afterMatch.toLowerCase().startsWith(noun));
            }
            return true;
        }
        // 5. 句号/问号/叹号后
        if (/[.!?。!?]\s*$/.test(beforeText)) {
            return true;
        }
        // 6. 列表符号后 (-, *, 1., •)
        if (/^[\s\-\*\d•]+[.、)]?\s*$/.test(beforeText)) {
            return true;
        }
        return false;
    }
    // 辅助函数: 获取序列符号
    function getSequenceSymbol(counter) {
        const symbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
        return counter <= 10 ? symbols[counter - 1] : `${counter}`;
    }
    // 遍历所有行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indentLevel = getIndentLevel(line);
        // 检测是否为标题行 (全大写或markdown标题)
        const isTitleLine = /^#+\s/.test(line) || /^[A-Z\s]+$/.test(line.trim());
        if (isTitleLine) {
            sequenceState.counter = 0;
            sequenceState.lastLineNumber = i;
            continue;
        }
        // 1. 处理序列词 (带计数)
        let sequenceWordFound = false;
        sequencePatterns.starters.regex.lastIndex = 0;
        let starterMatch;
        while ((starterMatch = sequencePatterns.starters.regex.exec(line)) !== null) {
            const matchedWord = starterMatch[0];
            if (isValidSequencePosition(line, starterMatch.index, matchedWord)) {
                sequenceState.counter = 1; // 重置为1
                sequenceState.lastLineNumber = i;
                sequenceState.lastIndentLevel = indentLevel;
                sequenceWordFound = true;
                const startPos = new vscode.Position(i, starterMatch.index);
                transitionDecorations.push({
                    range: new vscode.Range(startPos, startPos),
                    renderOptions: {
                        before: {
                            contentText: getSequenceSymbol(sequenceState.counter) + ' ',
                            color: new vscode.ThemeColor('editorCodeLens.foreground'),
                            margin: '0 4px 0 0',
                            fontWeight: 'bold'
                        }
                    }
                });
            }
        }
        // 1.2 检测延续词
        if (!sequenceWordFound) {
            sequencePatterns.continuers.regex.lastIndex = 0;
            let continuerMatch;
            while ((continuerMatch = sequencePatterns.continuers.regex.exec(line)) !== null) {
                const matchedWord = continuerMatch[0];
                if (isValidSequencePosition(line, continuerMatch.index, matchedWord)) {
                    // 检查是否需要重置
                    if (shouldResetCounter(i, indentLevel)) {
                        sequenceState.counter = 1;
                    }
                    else {
                        sequenceState.counter++;
                    }
                    sequenceState.lastLineNumber = i;
                    sequenceState.lastIndentLevel = indentLevel;
                    sequenceWordFound = true;
                    const startPos = new vscode.Position(i, continuerMatch.index);
                    transitionDecorations.push({
                        range: new vscode.Range(startPos, startPos),
                        renderOptions: {
                            before: {
                                contentText: getSequenceSymbol(sequenceState.counter) + ' ',
                                color: new vscode.ThemeColor('editorCodeLens.foreground'),
                                margin: '0 4px 0 0',
                                fontWeight: 'bold'
                            }
                        }
                    });
                }
            }
        }
        // 1.3 检测终止词
        if (!sequenceWordFound) {
            sequencePatterns.terminators.regex.lastIndex = 0;
            let terminatorMatch;
            while ((terminatorMatch = sequencePatterns.terminators.regex.exec(line)) !== null) {
                const matchedWord = terminatorMatch[0];
                if (isValidSequencePosition(line, terminatorMatch.index, matchedWord)) {
                    if (!shouldResetCounter(i, indentLevel)) {
                        sequenceState.counter++;
                    }
                    const startPos = new vscode.Position(i, terminatorMatch.index);
                    transitionDecorations.push({
                        range: new vscode.Range(startPos, startPos),
                        renderOptions: {
                            before: {
                                contentText: getSequenceSymbol(sequenceState.counter) + ' ',
                                color: new vscode.ThemeColor('editorCodeLens.foreground'),
                                margin: '0 4px 0 0',
                                fontWeight: 'bold'
                            }
                        }
                    });
                    // 终止后重置
                    sequenceState.counter = 0;
                    sequenceState.lastLineNumber = i;
                }
            }
        }
        // 2. 处理其他转折词 (不计数)
        for (const pattern of transitionPatterns) {
            let match;
            pattern.regex.lastIndex = 0;
            while ((match = pattern.regex.exec(line)) !== null) {
                const matchPos = match.index;
                const startPos = new vscode.Position(i, matchPos);
                transitionDecorations.push({
                    range: new vscode.Range(startPos, startPos),
                    renderOptions: {
                        before: {
                            contentText: pattern.symbol + ' ',
                            color: new vscode.ThemeColor('editorCodeLens.foreground'),
                            margin: '0 4px 0 0',
                            fontWeight: 'bold'
                        }
                    }
                });
            }
        }
        // 3. 标点符号装饰
        const punctuationRegex = /[。，、；：！？,.;:!?]/g;
        let punctMatch;
        while ((punctMatch = punctuationRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, punctMatch.index), new vscode.Position(i, punctMatch.index + 1));
            punctuationDecorations.push({ range });
        }
        // 4. 引号内容装饰
        const quoteRegex = /"([^"]*)"|'([^']*)'/g;
        let quoteMatch;
        while ((quoteMatch = quoteRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, quoteMatch.index), new vscode.Position(i, quoteMatch.index + quoteMatch[0].length));
            quotesDecorations.push({ range });
        }
        // 5. 书名号内容装饰
        const bookTitleRegex = /《([^》]*)》/g;
        let bookMatch;
        while ((bookMatch = bookTitleRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, bookMatch.index), new vscode.Position(i, bookMatch.index + bookMatch[0].length));
            bookTitleDecorations.push({ range });
        }
        // 6. 括号内容装饰
        const parenthesesRegex = /\([^)]*\)|【[^】]*】|\[[^\]]*\]|（[^）]*）/g;
        let parenMatch;
        while ((parenMatch = parenthesesRegex.exec(line)) !== null) {
            const range = new vscode.Range(new vscode.Position(i, parenMatch.index), new vscode.Position(i, parenMatch.index + parenMatch[0].length));
            parenthesesDecorations.push({ range });
        }
        // 7. 数字装饰
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