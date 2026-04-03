/**
 * 序列计数器模块
 * 处理序列词的识别和计数逻辑
 */

import * as vscode from 'vscode';
import { SequenceState } from './types';
import { getSequencePatterns } from './patterns';
import { getIndentLevel, isValidSequencePosition, getSequenceSymbol } from './utils';
import { createSequenceDecoration } from './decorators';

/**
 * 全局序列状态
 */
let sequenceState: SequenceState = {
    counter: 0,
    lastLineNumber: -1,
    lastIndentLevel: 0
};

/**
 * 重置序列计数器
 */
export function resetSequenceCounter(): void {
    sequenceState = {
        counter: 0,
        lastLineNumber: -1,
        lastIndentLevel: 0
    };
}

/**
 * 判断是否应该重置计数器
 * @param currentLine 当前行号
 * @param currentIndent 当前缩进层级
 * @returns 是否需要重置
 */
function shouldResetCounter(currentLine: number, currentIndent: number): boolean {
    // 首次运行
    if (sequenceState.lastLineNumber === -1) {
        return true;
    }

    // 行号间隔超过2行 (中间有空行)
    const lineGap = currentLine - sequenceState.lastLineNumber;
    if (lineGap > 2) {
        return true;
    }

    // 缩进层级变化 (可能是新的列表)
    if (Math.abs(currentIndent - sequenceState.lastIndentLevel) > 2) {
        return true;
    }

    return false;
}

/**
 * 处理起始词
 * @param line 文本行
 * @param lineNumber 行号
 * @param indentLevel 缩进层级
 * @returns 装饰选项数组
 */
function processStarters(
    line: string,
    lineNumber: number,
    indentLevel: number
): vscode.DecorationOptions[] {
    const decorations: vscode.DecorationOptions[] = [];
    const sequencePatterns = getSequencePatterns();
    sequencePatterns.starters.regex.lastIndex = 0;
    
    let match;
    while ((match = sequencePatterns.starters.regex.exec(line)) !== null) {
        const matchedWord = match[0];
        
        if (isValidSequencePosition(line, match.index, matchedWord)) {
            // 重置为1
            sequenceState.counter = 1;
            sequenceState.lastLineNumber = lineNumber;
            sequenceState.lastIndentLevel = indentLevel;

            const startPos = new vscode.Position(lineNumber, match.index);
            const endPos = new vscode.Position(lineNumber, match.index + matchedWord.length);
            const symbol = getSequenceSymbol(sequenceState.counter);
            decorations.push(createSequenceDecoration(new vscode.Range(startPos, endPos), symbol));
        }
    }

    return decorations;
}

/**
 * 处理延续词
 * @param line 文本行
 * @param lineNumber 行号
 * @param indentLevel 缩进层级
 * @returns 装饰选项数组
 */
function processContinuers(
    line: string,
    lineNumber: number,
    indentLevel: number
): vscode.DecorationOptions[] {
    const decorations: vscode.DecorationOptions[] = [];
    const sequencePatterns = getSequencePatterns();
    sequencePatterns.continuers.regex.lastIndex = 0;
    
    let match;
    while ((match = sequencePatterns.continuers.regex.exec(line)) !== null) {
        const matchedWord = match[0];
        
        if (isValidSequencePosition(line, match.index, matchedWord)) {
            // 检查是否需要重置
            if (shouldResetCounter(lineNumber, indentLevel)) {
                sequenceState.counter = 1;
            } else {
                sequenceState.counter++;
            }

            sequenceState.lastLineNumber = lineNumber;
            sequenceState.lastIndentLevel = indentLevel;

            const startPos = new vscode.Position(lineNumber, match.index);
            const endPos = new vscode.Position(lineNumber, match.index + matchedWord.length);
            const symbol = getSequenceSymbol(sequenceState.counter);
            decorations.push(createSequenceDecoration(new vscode.Range(startPos, endPos), symbol));
        }
    }

    return decorations;
}

/**
 * 处理终止词
 * @param line 文本行
 * @param lineNumber 行号
 * @param indentLevel 缩进层级
 * @returns 装饰选项数组
 */
function processTerminators(
    line: string,
    lineNumber: number,
    indentLevel: number
): vscode.DecorationOptions[] {
    const decorations: vscode.DecorationOptions[] = [];
    const sequencePatterns = getSequencePatterns();
    sequencePatterns.terminators.regex.lastIndex = 0;
    
    let match;
    while ((match = sequencePatterns.terminators.regex.exec(line)) !== null) {
        const matchedWord = match[0];
        
        if (isValidSequencePosition(line, match.index, matchedWord)) {
            // 如果不需要重置,则递增
            if (!shouldResetCounter(lineNumber, indentLevel)) {
                sequenceState.counter++;
            }

            const startPos = new vscode.Position(lineNumber, match.index);
            const endPos = new vscode.Position(lineNumber, match.index + matchedWord.length);
            const symbol = getSequenceSymbol(sequenceState.counter);
            decorations.push(createSequenceDecoration(new vscode.Range(startPos, endPos), symbol));

            // 终止后重置
            sequenceState.counter = 0;
            sequenceState.lastLineNumber = lineNumber;
        }
    }

    return decorations;
}

/**
 * 处理序列词(起始、延续、终止)
 * @param line 文本行
 * @param lineNumber 行号
 * @returns 装饰选项数组
 */
export function processSequenceWords(
    line: string,
    lineNumber: number
): vscode.DecorationOptions[] {
    const indentLevel = getIndentLevel(line);
    let decorations: vscode.DecorationOptions[] = [];

    // 1. 检测起始词
    const starterDecorations = processStarters(line, lineNumber, indentLevel);
    if (starterDecorations.length > 0) {
        return starterDecorations;
    }

    // 2. 检测延续词
    const continuerDecorations = processContinuers(line, lineNumber, indentLevel);
    if (continuerDecorations.length > 0) {
        return continuerDecorations;
    }

    // 3. 检测终止词
    const terminatorDecorations = processTerminators(line, lineNumber, indentLevel);
    if (terminatorDecorations.length > 0) {
        return terminatorDecorations;
    }

    return decorations;
}

/**
 * 处理标题行(遇到标题重置计数器)
 * @param lineNumber 行号
 */
export function handleTitleLine(lineNumber: number): void {
    sequenceState.counter = 0;
    sequenceState.lastLineNumber = lineNumber;
}
