/**
 * 序列计数器状态
 */
export interface SequenceState {
    counter: number;
    lastLineNumber: number;
    lastIndentLevel: number;
}

/**
 * 关联词模式配置
 */
export interface TransitionPattern {
    regex: RegExp;
    symbol: string;
}

/**
 * 序列词模式配置
 */
export interface SequencePattern {
    regex: RegExp;
    isStarter?: boolean;
    isTerminator?: boolean;
}

/**
 * 序列词模式集合
 */
export interface SequencePatterns {
    starters: SequencePattern;
    continuers: SequencePattern;
    terminators: SequencePattern;
}
