/**
 * 装饰器管理模块
 * 负责创建、应用和处理文本装饰
 */

import * as vscode from 'vscode';
import { transitionPatterns } from './patterns';

/**
 * 关联词装饰类型
 */
let transitionDecorationType: vscode.TextEditorDecorationType;

/**
 * 初始化装饰器
 * 在扩展激活时调用
 */
export function initializeDecorations(): void {
    // 关联词符号装饰 - 只添加符号,不改变颜色
    transitionDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 4px 0 0',
            fontWeight: 'bold'
        }
    });
}

/**
 * 创建符号装饰选项
 * @param position 装饰位置
 * @param symbol 要显示的符号
 * @returns 装饰选项
 */
export function createSymbolDecoration(
    position: vscode.Position,
    symbol: string
): vscode.DecorationOptions {
    return {
        range: new vscode.Range(position, position),
        renderOptions: {
            before: {
                contentText: symbol + ' ',
                color: new vscode.ThemeColor('editorCodeLens.foreground'),
                margin: '0 4px 0 0',
                fontWeight: 'bold'
            }
        }
    };
}

/**
 * 处理普通关联词装饰(不参与序列计数)
 * @param line 文本行
 * @param lineNumber 行号
 * @returns 装饰选项数组
 */
export function processTransitionWords(
    line: string,
    lineNumber: number
): vscode.DecorationOptions[] {
    const decorations: vscode.DecorationOptions[] = [];

    for (const pattern of transitionPatterns) {
        let match;
        pattern.regex.lastIndex = 0;

        while ((match = pattern.regex.exec(line)) !== null) {
            const matchPos = match.index;
            const startPos = new vscode.Position(lineNumber, matchPos);
            decorations.push(createSymbolDecoration(startPos, pattern.symbol));
        }
    }

    return decorations;
}

/**
 * 应用所有装饰到编辑器
 * @param editor 文本编辑器
 * @param decorations 装饰选项数组
 */
export function applyDecorations(
    editor: vscode.TextEditor,
    decorations: vscode.DecorationOptions[]
): void {
    editor.setDecorations(transitionDecorationType, decorations);
}

/**
 * 清理装饰器资源
 * 在扩展停用时调用
 */
export function disposeDecorations(): void {
    if (transitionDecorationType) {
        transitionDecorationType.dispose();
    }
}
