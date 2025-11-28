import * as vscode from 'vscode';

let transitionDecorationType: vscode.TextEditorDecorationType;

interface SequenceState {
    counter: number;
    lastLineNumber: number;
    lastIndentLevel: number;
}

let sequenceState: SequenceState = {
    counter: 0,
    lastLineNumber: -1,
    lastIndentLevel: 0
};

export function activate(context: vscode.ExtensionContext) {
    console.log('Rich Text extension activated');

    // 转折词符号装饰 - 只添加符号,不改变颜色
    transitionDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 4px 0 0',
            fontWeight: 'bold'
        }
    });

    // 删除其他装饰类型,因为 tmLanguage.json 已经处理颜色
    // 不再需要 punctuationDecorationType, quotesDecorationType 等

    // 监听文档变化
    let timeout: NodeJS.Timeout | undefined = undefined;
    
    const triggerUpdateDecorations = (editor: vscode.TextEditor | undefined) => {
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
        const formatted: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            formatted.push(lines[i]);
            
            // 检测观点切换（简单规则：句号后跟转折词）
            if (lines[i].match(/[。.!?]$/) && lines[i + 1]?.match(/^(However|But|然而|但是)/)) {
                formatted.push(''); // 插入空行
            }
        }

        await editor.edit(editBuilder => {
            const fullRange = new vscode.Range(
                editor.document.positionAt(0),
                editor.document.positionAt(text.length)
            );
            editBuilder.replace(fullRange, formatted.join('\n'));
        });

        vscode.window.showInformationMessage('格式化完成');
    });

    context.subscriptions.push(formatCommand);
}

function updateDecorations(editor: vscode.TextEditor | undefined) {
    if (!editor || editor.document.languageId !== 'richtext') {
        return;
    }

    const text = editor.document.getText();
    const lines = text.split('\n');
    
    const transitionDecorations: vscode.DecorationOptions[] = [];
    // 删除其他装饰数组

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

    // 辅助函数保持不变
    function shouldResetCounter(currentLine: number, currentIndent: number): boolean {
        if (sequenceState.lastLineNumber === -1) {
            return true;
        }
        const lineGap = currentLine - sequenceState.lastLineNumber;
        if (lineGap > 2) {
            return true;
        }
        if (Math.abs(currentIndent - sequenceState.lastIndentLevel) > 2) {
            return true;
        }
        return false;
    }

    function getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    function isValidSequencePosition(line: string, matchIndex: number, matchedWord: string): boolean {
        const beforeText = line.substring(0, matchIndex).trim();
        const afterMatch = line.substring(matchIndex + matchedWord.length).trim();
        const nounIndicators = [
            'place', 'time', 'step', 'thing', 'person', 'day', 'year',
            'grade', 'prize', 'attempt', 'impression', 'name', 'class',
            '名', '次', '位', '等', '奖', '课', '名次', '名额'
        ];
        
        for (const indicator of nounIndicators) {
            if (afterMatch.toLowerCase().startsWith(indicator)) {
                return false;
            }
        }

        const articlePattern = /\b(the|a|an|this|that|my|your|his|her)\s+$/i;
        if (articlePattern.test(beforeText)) {
            return false;
        }

        if (beforeText === '') {
            const hasProperPunctuation = /^[,，.。:：]/.test(afterMatch) || 
                                        /^ly\b/.test(afterMatch);
            if (!hasProperPunctuation && afterMatch.length > 0) {
                return !nounIndicators.some(noun => 
                    afterMatch.toLowerCase().startsWith(noun)
                );
            }
            return true;
        }

        if (/[.!?。!?]\s*$/.test(beforeText)) {
            return true;
        }

        if (/^[\s\-\*\d•]+[.、)]?\s*$/.test(beforeText)) {
            return true;
        }

        return false;
    }

    function getSequenceSymbol(counter: number): string {
        const symbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
        return counter <= 10 ? symbols[counter - 1] : `${counter}`;
    }
    
    // 遍历所有行 - 只处理符号添加
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indentLevel = getIndentLevel(line);

        const isTitleLine = /^#+\s/.test(line) || /^[A-Z\s]+$/.test(line.trim());
        if (isTitleLine) {
            sequenceState.counter = 0;
            sequenceState.lastLineNumber = i;
            continue;
        }

        let sequenceWordFound = false;

        // 1.1 检测起始词
        sequencePatterns.starters.regex.lastIndex = 0;
        let starterMatch;
        while ((starterMatch = sequencePatterns.starters.regex.exec(line)) !== null) {
            const matchedWord = starterMatch[0];
            if (isValidSequencePosition(line, starterMatch.index, matchedWord)) {
                sequenceState.counter = 1;
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
                    if (shouldResetCounter(i, indentLevel)) {
                        sequenceState.counter = 1;
                    } else {
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

        // 删除标点/引号/括号等装饰逻辑,由 tmLanguage.json 处理
    }

    // 只应用符号装饰
    editor.setDecorations(transitionDecorationType, transitionDecorations);
}

export function deactivate() {
    if (transitionDecorationType) transitionDecorationType.dispose();
}