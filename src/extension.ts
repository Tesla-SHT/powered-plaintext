import * as vscode from 'vscode';

let decorationType: vscode.TextEditorDecorationType;

export function activate(context: vscode.ExtensionContext) {
    console.log('Rich Text extension activated');

    // 创建装饰类型（虚拟文本样式）
    decorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 8px 0 0',
            fontWeight: 'bold'
        }
    });

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
    const decorations: vscode.DecorationOptions[] = [];

    // 定义所有匹配规则
    const patterns = [
        { regex: /\b([Bb]ecause|[Ss]ince|[Aa]s)\b|因为|由于|既然/g, symbol: '→' },
        { regex: /\b([Tt]herefore|[Tt]hus|[Ss]o|[Hh]ence|[Cc]onsequently)\b|因此|所以|故而|从而/g, symbol: '⇒' },
        { regex: /\b([Bb]ut|[Hh]owever|[Yy]et|[Aa]lthough|[Tt]hough|[Ww]hile)\b|然而|但是|却|不过|虽然/g, symbol: '⇄' },
        { regex: /\b([Mm]oreover|[Ff]urthermore|[Aa]dditionally|[Aa]lso)\b|此外|并且|而且|同时|另外/g, symbol: '⊕' },
        { regex: /\b([Ii]n conclusion|[Ii]n summary|[Oo]verall|[Ff]inally)\b|总之|综上|总体来看|最后/g, symbol: '◆' }
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 遍历所有模式，找到所有匹配
        for (const pattern of patterns) {
            let match;
            // 重置正则表达式的 lastIndex
            pattern.regex.lastIndex = 0;
            
            while ((match = pattern.regex.exec(line)) !== null) {
                const matchPos = match.index;
                const startPos = new vscode.Position(i, matchPos);
                
                const decoration: vscode.DecorationOptions = {
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
                decorations.push(decoration);
            }
        }
    }

    editor.setDecorations(decorationType, decorations);
}

export function deactivate() {
    if (decorationType) {
        decorationType.dispose();
    }
}