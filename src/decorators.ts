/**
 * 装饰器管理模块
 * 负责创建、应用和处理动态文本装饰
 */

import * as vscode from 'vscode';
import { getRuntimeConfiguration, getTransitionPatterns } from './patterns';
import { TransitionCategory } from './types';
import { isValidTransitionPosition } from './utils';

export interface DecorationCollection {
    transitions: Record<TransitionCategory, vscode.DecorationOptions[]>;
    sequence: vscode.DecorationOptions[];
}

const transitionCategories: TransitionCategory[] = [
    'causation',
    'result',
    'contrast',
    'addition',
    'summary',
    'example'
];

const transitionDecorationColors: Record<TransitionCategory, string> = {
    causation: 'terminal.ansiBlue',
    result: 'terminal.ansiGreen',
    contrast: 'terminal.ansiRed',
    addition: 'terminal.ansiCyan',
    summary: 'terminal.ansiMagenta',
    example: 'terminal.ansiYellow'
};

/**
 * 关联词装饰类型
 */
let transitionDecorationTypes: Record<TransitionCategory, vscode.TextEditorDecorationType>;
let sequenceDecorationType: vscode.TextEditorDecorationType;

/**
 * 初始化装饰器
 * 在扩展激活时调用
 */
export function initializeDecorations(): void {
    transitionDecorationTypes = {
        causation: createDecorationType(transitionDecorationColors.causation),
        result: createDecorationType(transitionDecorationColors.result),
        contrast: createDecorationType(transitionDecorationColors.contrast),
        addition: createDecorationType(transitionDecorationColors.addition),
        summary: createDecorationType(transitionDecorationColors.summary),
        example: createDecorationType(transitionDecorationColors.example)
    };

    sequenceDecorationType = createDecorationType('editorInfo.foreground');
}

/**
 * 创建空装饰集合
 * @returns 装饰集合
 */
export function createDecorationCollection(): DecorationCollection {
    return {
        transitions: {
            causation: [],
            result: [],
            contrast: [],
            addition: [],
            summary: [],
            example: []
        },
        sequence: []
    };
}

/**
 * 创建序列词装饰选项
 * @param range 装饰范围
 * @param symbol 要显示的符号
 * @returns 装饰选项
 */
export function createSequenceDecoration(
    range: vscode.Range,
    symbol: string
): vscode.DecorationOptions {
    return createDecoration(
        range,
        symbol,
        'editorInfo.foreground',
        getRuntimeConfiguration().enableSymbolHints
    );
}

/**
 * 处理普通关联词装饰(不参与序列计数)
 * @param line 文本行
 * @param lineNumber 行号
 * @param decorations 装饰集合
 */
export function processTransitionWords(
    line: string,
    lineNumber: number,
    decorations: DecorationCollection
): void {
    const runtimeConfiguration = getRuntimeConfiguration();

    for (const pattern of getTransitionPatterns()) {
        let match;
        pattern.regex.lastIndex = 0;

        while ((match = pattern.regex.exec(line)) !== null) {
            const matchedWord = match[0];
            if (!isValidTransitionPosition(line, match.index)) {
                continue;
            }

            const startPos = new vscode.Position(lineNumber, match.index);
            const endPos = new vscode.Position(lineNumber, match.index + matchedWord.length);
            decorations.transitions[pattern.category].push(
                createDecoration(
                    new vscode.Range(startPos, endPos),
                    pattern.symbol,
                    transitionDecorationColors[pattern.category],
                    runtimeConfiguration.enableSymbolHints
                )
            );
        }
    }
}

/**
 * 应用所有装饰到编辑器
 * @param editor 文本编辑器
 * @param decorations 装饰集合
 */
export function applyDecorations(
    editor: vscode.TextEditor,
    decorations: DecorationCollection
): void {
    for (const category of transitionCategories) {
        editor.setDecorations(transitionDecorationTypes[category], decorations.transitions[category]);
    }

    editor.setDecorations(sequenceDecorationType, decorations.sequence);
}

/**
 * 清理装饰器资源
 * 在扩展停用时调用
 */
export function disposeDecorations(): void {
    if (transitionDecorationTypes) {
        for (const category of transitionCategories) {
            transitionDecorationTypes[category].dispose();
        }
    }

    if (sequenceDecorationType) {
        sequenceDecorationType.dispose();
    }
}

function createDecorationType(colorId: string): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
        color: new vscode.ThemeColor(colorId)
    });
}

function createDecoration(
    range: vscode.Range,
    symbol: string,
    colorId: string,
    showSymbol = true
): vscode.DecorationOptions {
    if (!showSymbol) {
        return { range };
    }

    return {
        range,
        renderOptions: {
            before: {
                contentText: symbol + ' ',
                color: new vscode.ThemeColor(colorId),
                margin: '0 4px 0 0',
                fontWeight: 'bold'
            }
        }
    };
}
