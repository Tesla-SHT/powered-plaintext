/**
 * 工具函数模块
 * 提供文本处理、位置检测等辅助功能
 */

/**
 * 获取文本行的缩进层级
 * @param line 文本行
 * @returns 缩进空格数
 */
export function getIndentLevel(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
}

/**
 * 判断是否为标题行
 * @param line 文本行
 * @returns 是否为标题
 */
export function isTitleLine(line: string): boolean {
    // Markdown 标题或全大写标题
    return /^#+\s/.test(line) || /^[A-Z\s]+$/.test(line.trim());
}

/**
 * 获取序列符号
 * @param counter 计数器值
 * @returns 对应的序列符号
 */
export function getSequenceSymbol(counter: number): string {
    const symbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
    return counter <= 10 ? symbols[counter - 1] : `${counter}`;
}

/**
 * 判断关联词是否位于适合显示提示的位置
 * 仅在线首、列表项后、或强边界（句末、冒号）后触发，避免句中误判
 *
 * @param line 当前行文本
 * @param matchIndex 匹配位置
 * @returns 是否为有效关联词位置
 */
export function isValidTransitionPosition(
    line: string,
    matchIndex: number
): boolean {
    const beforeText = line.substring(0, matchIndex).trim();

    if (beforeText === '') {
        return true;
    }

    if (/[.!?。！？:：]["'”’）】\]\)]*$/.test(beforeText)) {
        return true;
    }

    if (/^[\s\-*\d•]+[.、)]?\s*$/.test(beforeText)) {
        return true;
    }

    return false;
}

/**
 * 判断序列词是否在有效位置
 * 排除名词短语、句中位置等误判情况
 * 
 * @param line 当前行文本
 * @param matchIndex 匹配位置
 * @param matchedWord 匹配到的词
 * @returns 是否为有效序列词位置
 */
export function isValidSequencePosition(
    line: string,
    matchIndex: number,
    matchedWord: string
): boolean {
    const beforeText = line.substring(0, matchIndex).trim();
    const afterMatch = line.substring(matchIndex + matchedWord.length).trim();

    // 名词指示器列表 - 如果序列词后跟这些词,通常是名词短语
    const nounIndicators = [
        'place', 'time', 'step', 'thing', 'person', 'day', 'year',
        'grade', 'prize', 'attempt', 'impression', 'name', 'class',
        '名', '次', '位', '等', '奖', '课', '名次', '名额'
    ];

    // 检查后续词是否为名词指示器
    for (const indicator of nounIndicators) {
        if (afterMatch.toLowerCase().startsWith(indicator)) {
            return false;
        }
    }

    // 检查前面是否有冠词/限定词
    const articlePattern = /\b(the|a|an|this|that|my|your|his|her)\s+$/i;
    if (articlePattern.test(beforeText)) {
        return false;
    }

    // 句首位置检查
    if (beforeText === '') {
        // 如果在句首,后面应该跟标点符号或者是 -ly 形式
        const hasProperPunctuation = /^[,，.。:：]/.test(afterMatch) || 
                                    /^ly\b/.test(afterMatch);
        if (!hasProperPunctuation && afterMatch.length > 0) {
            // 进一步检查是否为名词短语
            return !nounIndicators.some(noun => 
                afterMatch.toLowerCase().startsWith(noun)
            );
        }
        return true;
    }

    // 句号/问号/叹号后
    if (/[.!?。!?]\s*$/.test(beforeText)) {
        return true;
    }

    // 列表符号后 (-, *, 1., •)
    if (/^[\s\-\*\d•]+[.、)]?\s*$/.test(beforeText)) {
        return true;
    }

    return false;
}
