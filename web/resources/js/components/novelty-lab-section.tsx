import { useState } from 'react';
import {
    AlertTriangle,
    Award,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    FlaskConical,
    Lightbulb,
    RefreshCw,
    SearchCheck,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import type { ResearchGap, ResearchProject } from '@/types/research';

type Props = {
    project: ResearchProject;
    onVerifyGap: (gapId: string) => void;
    verifyingGapId: string | null;
    onDraftIdea: (gapId: string) => void;
};

export function NoveltyLabSection({
    project,
    onVerifyGap,
    verifyingGapId,
    onDraftIdea,
}: Props) {
    const gaps = project.research_gaps ?? [];
    const verifiedGaps = gaps.filter(
        (g) => g.novelty_verification?.status === 'completed'
    );
    const unverifiedGaps = gaps.filter(
        (g) => !g.novelty_verification || g.novelty_verification.status !== 'completed'
    );

    const [expandedGapIds, setExpandedGapIds] = useState<Record<string, boolean>>({});

    function toggleExpand(id: string) {
        setExpandedGapIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    const avgScore =
        verifiedGaps.length > 0
            ? Math.round(
                  verifiedGaps.reduce(
                      (acc, g) => acc + (g.novelty_verification?.novelty_score ?? 0),
                      0
                  ) / verifiedGaps.length
              )
            : 0;

    const highlyNovelCount = verifiedGaps.filter(
        (g) => (g.novelty_verification?.novelty_score ?? 0) >= 80
    ).length;

    const moderateCount = verifiedGaps.filter((g) => {
        const score = g.novelty_verification?.novelty_score ?? 0;
        return score >= 50 && score < 80;
    }).length;

    const saturatedCount = verifiedGaps.filter(
        (g) => (g.novelty_verification?.novelty_score ?? 0) < 50
    ).length;

    return (
        <section
            id="novelty"
            className="research-surface scroll-mt-24 rounded-3xl border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-enter-delay-2"
        >
            <div className="flex flex-col gap-4 border-b border-border/80 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25">
                            <Lightbulb className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                Novelty Verification Lab
                            </h2>
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Cross-references discovered gaps against Semantic Scholar and arXiv to compute evidence-based novelty scores and identify literature saturation.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {unverifiedGaps.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                const next = unverifiedGaps[0];
                                if (next) onVerifyGap(next.id);
                            }}
                            disabled={verifyingGapId !== null}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:shadow-lg hover:shadow-amber-500/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                        >
                            {verifyingGapId ? (
                                <>
                                    <RefreshCw className="size-3.5 animate-spin" />
                                    Verifying Against Literature...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-3.5" />
                                    Verify Next Gap ({unverifiedGaps.length} pending)
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid border-b border-border/80 md:grid-cols-4">
                <div className="border-b border-border/80 p-5 md:border-b-0 md:border-r">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Verified Literature Gaps
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                        {verifiedGaps.length}
                        <span className="text-xs font-medium text-muted-foreground">
                            {' '}/ {gaps.length} discovered
                        </span>
                    </p>
                </div>

                <div className="border-b border-border/80 p-5 md:border-b-0 md:border-r">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Average Novelty Index
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-foreground">
                            {avgScore}%
                        </span>
                        <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                avgScore >= 80
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : avgScore >= 50
                                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                            }`}
                        >
                            {avgScore >= 80
                                ? 'High Frontier'
                                : avgScore >= 50
                                ? 'Moderate Originality'
                                : 'High Saturation'}
                        </span>
                    </div>
                </div>

                <div className="border-b border-border/80 p-5 md:border-b-0 md:border-r">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Highly Novel Gaps
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {highlyNovelCount}
                        <span className="text-xs font-medium text-muted-foreground">
                            {' '}(≥ 80% novelty score)
                        </span>
                    </p>
                </div>

                <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Literature Saturation Warnings
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
                        {saturatedCount}
                        <span className="text-xs font-medium text-muted-foreground">
                            {' '}(&lt; 50% novelty)
                        </span>
                    </p>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 md:p-6">
                {gaps.length === 0 ? (
                    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/40 shadow-sm">
                            <SearchCheck className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-foreground">
                            No Research Gaps Available Yet
                        </h3>
                        <p className="mt-1 max-w-md text-xs text-muted-foreground">
                            Discover research gaps in section 3 before conducting external literature novelty verification.
                        </p>
                    </div>
                ) : verifiedGaps.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-8 text-center">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shadow-sm">
                            <Lightbulb className="size-8" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-foreground">
                            Ready to Verify Gap Novelty Against External Literature
                        </h3>
                        <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-muted-foreground">
                            You have {gaps.length} discovered research gaps. Verify any gap to search recent publications on Semantic Scholar &amp; arXiv, assess publication saturation, and calculate an objective 0–100% Novelty Score.
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {gaps.slice(0, 3).map((gap) => (
                                <button
                                    key={gap.id}
                                    type="button"
                                    onClick={() => onVerifyGap(gap.id)}
                                    disabled={verifyingGapId === gap.id}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-background/90 px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                                >
                                    <Sparkles className="size-3.5 text-amber-500" />
                                    Verify "{gap.title.slice(0, 30)}..."
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {verifiedGaps.map((gap) => {
                            const ver = gap.novelty_verification!;
                            const isExpanded = expandedGapIds[gap.id] ?? true;
                            const isHighlyNovel = ver.novelty_score >= 80;
                            const isModerate = ver.novelty_score >= 50 && ver.novelty_score < 80;

                            return (
                                <article
                                    key={gap.id}
                                    className="research-surface rounded-3xl border border-border/80 p-6 shadow-sm transition-all duration-200 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
                                >
                                    {/* Top Gap Header */}
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div className="min-w-0 max-w-3xl">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                                        isHighlyNovel
                                                            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                                            : isModerate
                                                            ? 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-400'
                                                            : 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {ver.novelty_verdict}
                                                </span>
                                                <span className="text-xs font-medium text-muted-foreground capitalize">
                                                    Category: {gap.category}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    • Actionability: <strong className="text-foreground">{gap.actionability_score}/10</strong>
                                                </span>
                                            </div>

                                            <h3 className="mt-2 text-base font-bold leading-snug tracking-tight text-foreground">
                                                {gap.title}
                                            </h3>
                                        </div>

                                        {/* Novelty Score Gauge & Actions */}
                                        <div className="flex shrink-0 items-center gap-3">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-semibold text-foreground">
                                                        {ver.novelty_score}%
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        Novelty
                                                    </span>
                                                </div>
                                                <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            isHighlyNovel
                                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                                                : isModerate
                                                                ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                                                                : 'bg-gradient-to-r from-rose-500 to-red-400'
                                                        }`}
                                                        style={{ width: `${ver.novelty_score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onDraftIdea(gap.id)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-500/25 transition hover:shadow-md hover:brightness-110"
                                            >
                                                <FlaskConical className="size-3.5" />
                                                Draft Blueprint
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(gap.id)}
                                                className="rounded-xl border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                title={isExpanded ? 'Collapse' : 'Expand'}
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="size-4" />
                                                ) : (
                                                    <ChevronDown className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Novelty Verification Breakdown */}
                                    {isExpanded && (
                                        <div className="mt-5 space-y-4 border-t border-border/80 pt-4">
                                            {/* Synthesis */}
                                            {ver.synthesis && (
                                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-foreground/90">
                                                    <p className="font-bold text-amber-800 dark:text-amber-300">
                                                        Scholarly Literature Synthesis
                                                    </p>
                                                    <p className="mt-1.5 whitespace-pre-line text-muted-foreground">
                                                        {ver.synthesis}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Overlapping External Scholarly Papers */}
                                            {ver.overlapping_papers && ver.overlapping_papers.length > 0 && (
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            External Published Literature &amp; Overlap ({ver.overlapping_papers.length})
                                                        </p>
                                                        <span className="rounded-md border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                                                            Semantic Scholar &amp; arXiv
                                                        </span>
                                                    </div>

                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {ver.overlapping_papers.map((paper, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background/80 p-3.5 text-xs shadow-xs"
                                                            >
                                                                <div>
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <span
                                                                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize ${
                                                                                paper.overlap_level === 'high'
                                                                                    ? 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                                                                    : paper.overlap_level === 'moderate'
                                                                                    ? 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                                                                                    : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                                            }`}
                                                                        >
                                                                            Overlap: {paper.overlap_level}
                                                                        </span>

                                                                        {paper.year && (
                                                                            <span className="rounded-md border bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                                                                {paper.year}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <h4 className="mt-2 font-bold text-foreground leading-snug">
                                                                        {paper.title}
                                                                    </h4>

                                                                    {paper.authors && paper.authors.length > 0 && (
                                                                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                                                                            {paper.authors.join(', ')}
                                                                        </p>
                                                                    )}

                                                                    <p className="mt-2 text-[11px] text-foreground/85 leading-relaxed">
                                                                        <strong className="text-foreground">Relevance: </strong>
                                                                        {paper.relevance_explanation}
                                                                    </p>
                                                                </div>

                                                                <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2 text-[11px] text-muted-foreground">
                                                                    <span className="font-medium">{paper.venue || 'Scholarly Paper'}</span>
                                                                    {paper.url && (
                                                                        <a
                                                                            href={paper.url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                                                                        >
                                                                            View Paper <ExternalLink className="size-3" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Distinguishing Angles & Pitfalls */}
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {ver.distinguishing_angles && ver.distinguishing_angles.length > 0 && (
                                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                                                        <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                            <Award className="size-4" /> Tactical Distinguishing Angles
                                                        </p>
                                                        <ul className="mt-2.5 space-y-1.5 text-xs text-foreground/90">
                                                            {ver.distinguishing_angles.map((angle, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                                                    <span>{angle}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {ver.potential_pitfalls && ver.potential_pitfalls.length > 0 && (
                                                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                                                        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                                                            <ShieldAlert className="size-4" /> Validation Pitfalls to Avoid
                                                        </p>
                                                        <ul className="mt-2.5 space-y-1.5 text-xs text-foreground/90">
                                                            {ver.potential_pitfalls.map((pitfall, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                                                                    <span>{pitfall}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Re-verify action */}
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onVerifyGap(gap.id)}
                                                    disabled={verifyingGapId === gap.id}
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition"
                                                >
                                                    <RefreshCw className={`size-3 ${verifyingGapId === gap.id ? 'animate-spin' : ''}`} />
                                                    Re-verify against latest publications
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
