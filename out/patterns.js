"use strict";
/**
 * 模式配置模块
 * 定义所有正则表达式和匹配规则
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionPatterns = exports.sequencePatterns = void 0;
/**
 * 序列词模式配置
 * 用于识别和计数序列关系词
 */
exports.sequencePatterns = {
    // 起始词 - 重置计数器为1
    starters: {
        regex: /\b([Ff]irst(ly)?|[Ii]nitially|[Tt]o begin with)\b|首先|第一/g,
        isStarter: true
    },
    // 延续词 - 递增计数器
    continuers: {
        regex: /\b([Ss]econd(ly)?|[Tt]hird(ly)?|[Nn]ext|[Tt]hen|[Aa]fter that|[Mm]oreover)\b|其次|第二|第三|然后|接着|再次/g,
        isStarter: false
    },
    // 终止词 - 显示计数后重置
    terminators: {
        regex: /\b([Ff]inally|[Ll]astly|[Ii]n the end)\b|最后|终于/g,
        isTerminator: true
    }
};
/**
 * 关联词模式配置
 * 用于添加逻辑符号提示
 */
exports.transitionPatterns = [
    {
        regex: /\b([B]ecause|[S]ince|[A]s|[D]ue to)\b|因为|由于|既然|鉴于/g,
        symbol: '→'
    },
    {
        regex: /\b([T]herefore|[T]hus|[S]o|[H]ence|[C]onsequently|[A]ccordingly)\b|因此|所以|故而|从而|由此/g,
        symbol: '⇒'
    },
    {
        regex: /\b([B]ut|[H]owever|[Y]et|[A]lthough|[T]hough|[W]hile|[N]evertheless|[N]onetheless|[O]n the other hand|[I]n contrast|[C]onversely)\b|但是|然而|却|不过|虽然|尽管|相反|反之/g,
        symbol: '⇄'
    },
    {
        regex: /\b([M]oreover|[F]urthermore|[A]dditionally|[A]lso|[B]esides|[I]n addition|[W]hat's more|[L]ikewise|[S]imilarly)\b|此外|并且|而且|同时|另外|再者|同样|类似地/g,
        symbol: '⊕'
    },
    {
        regex: /\b([I]n conclusion|[I]n summary|[O]verall|[T]o sum up|[I]n short|[A]ll in all)\b|总之|综上|总体来看|总而言之|简而言之/g,
        symbol: '◆'
    },
    {
        regex: /\b([F]or example|[F]or instance|[S]uch as|[N]amely|[I]ncluding)\b|例如|比如|诸如|包括|譬如/g,
        symbol: '📌'
    }
];
//# sourceMappingURL=patterns.js.map