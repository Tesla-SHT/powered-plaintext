/**
 * Rich Text 扩展主文件
 * 提供智能语法高亮和逻辑符号提示功能
 */

import * as vscode from 'vscode';
import { initializeDecorations, applyDecorations, processTransitionWords, disposeDecorations } from './decorators';
import { processSequenceWords, handleTitleLine, resetSequenceCounter } from './sequenceCounter';
import { isTitleLine } from './utils';

/**
 * 扩展激活函数
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Rich Text extension activated');

    // 初始化装饰器
    initializeDecorations();

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
            resetSequenceCounter(); // 切换文档时重置计数器
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
        await autoFormatDocument();
    });

    context.subscriptions.push(formatCommand);
}

/**
 * 更新文本装饰
 * @param editor 文本编辑器
 */
function updateDecorations(editor: vscode.TextEditor | undefined) {
    if (!editor || editor.document.languageId !== 'richtext') {
        return;
    }

    const text = editor.document.getText();
    const lines = text.split('\n');
    const allDecorations: vscode.DecorationOptions[] = [];

    // 遍历所有行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检测标题行
        if (isTitleLine(line)) {
            handleTitleLine(i);
            continue;
        }

        // 处理序列词(①②③...)
        const sequenceDecorations = processSequenceWords(line, i);
        allDecorations.push(...sequenceDecorations);

        // 处理关联词(→⇒⇄...)
        const transitionDecorations = processTransitionWords(line, i);
        allDecorations.push(...transitionDecorations);
    }

    // 应用所有装饰
    applyDecorations(editor, allDecorations);
}

/**
 * 自动格式化文档
 */
async function autoFormatDocument(): Promise<void> {
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

        // 检测观点切换（简单规则：句号后跟关联词）
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
}

/**
 * 扩展停用函数
 */
export function deactivate() {
    disposeDecorations();
}