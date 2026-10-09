import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    Bookmark,
    CheckCircle2,
    FlaskConical,
    Lightbulb,
    RefreshCw,
    SearchCheck,
    Sparkles,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProjectWorkspaceHeader } from '@/components/project-workspace-header';
import type { BreadcrumbItem } from '@/types';
import type { ResearchProject } from '@/types/research';

type Props = { project: ResearchProject };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
    { title: 'Research Gaps', href: '#' },
];

export default function ProjectGapsPage({ project }: Props) {
    const [discoveringGaps, setDiscoveringGaps] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [verifyingGapId, setVerifyingGapId] = useState<string | null>(null);

    const analyzedPapers = project.papers.filter((p) => p.processing_status === 'completed');
    const researchGaps = project.research_gaps ?? [];

    const isDiscoveryRunning = discoveringGaps || project.gap_discovery_status === 'discovering';
    const hasVerifyingGap = researchGaps.some(
        (g) => g.novelty_verification?.status === 'processing' || g.novelty_verification?.status === 'pending'
    );
    const isRunning = isDiscoveryRunning || verifyingGapId !== null || hasVerifyingGap;

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            router.reload({ only: ['project'] });
        }, 3000);

        return () => clearInterval(interval);
    }, [isRunning]);

    function getPaperTitle(id: string): string {
        const found = project.papers.find((p) => p.id === id);
        return found?.title || found?.original_filename || 'Unknown Paper';
    }

    function discoverGaps() {
        if (analyzedPapers.length === 0) {
            toast.error('At least 1 analyzed paper is required to discover research gaps.');
            return;
        }

        setDiscoveringGaps(true);
        router.post(
            `/projects/${project.id}/gaps/discover`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Research gap discovery queued.');
                    setDiscoveringGaps(false);
                },
                onError: () => {
                    toast.error('Failed to trigger gap discovery.');
                    setDiscoveringGaps(false);
                },
            }
        );
    }

    function updateGapStatus(gapId: string, status: string) {
        router.patch(
            `/gaps/${gapId}`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Gap status updated to ${status}.`);
                },
                onError: () => {
                    toast.error('Failed to update gap status.');
                },
            }
        );
    }

    function verifyGap(gapId: string) {
        setVerifyingGapId(gapId);
        router.post(
            `/gaps/${gapId}/verify-novelty`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Novelty verification queued against scholarly literature.');
                    setVerifyingGapId(null);
                },
                onError: () => {
                    toast.error('Failed to trigger novelty verification.');
                    setVerifyingGapId(null);
                },
            }
        );
    }

    function generateIdea(gapId: string) {
        router.post(
            `/projects/${project.id}/ideas/generate`,
            { research_gap_id: gapId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Research idea blueprint generation queued. Redirecting to ideas lab...');
                    router.visit(`/projects/${project.id}/ideas`);
                },
                onError: () => {
                    toast.error('Failed to trigger blueprint generation.');
                },
            }
        );
    }

    const filteredGaps = researchGaps.filter((gap) => {
        const matchesCategory = selectedCategory === 'all' || gap.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || gap.status === selectedStatus;
        return matchesCategory && matchesStatus;
    });

    const categoryCounts: Record<string, number> = {
        all: researchGaps.length,
        methodological: researchGaps.filter((g) => g.category === 'methodological').length,
        empirical: researchGaps.filter((g) => g.category === 'empirical').length,
        theoretical: researchGaps.filter((g) => g.category === 'theoretical').length,
        application: researchGaps.filter((g) => g.category === 'application').length,
    };

    const statusCounts: Record<string, number> = {
        all: researchGaps.length,
        discovered: researchGaps.filter((g) => g.status === 'discovered').length,
        investigating: researchGaps.filter((g) => g.status === 'investigating').length,
        saved: researchGaps.filter((g) => g.status === 'saved').length,
        dismissed: researchGaps.filter((g) => g.status === 'dismissed').length,
    };

    return (
        <>
            <Head title={`Research Gaps - ${project.title}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <ProjectWorkspaceHeader project={project} activeTab="gaps" />

                {/* Error Banner */}
                {project.gap_discovery_error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold">Research gap discovery encountered an error</p>
                            <p className="mt-1 text-xs text-destructive/80">{project.gap_discovery_error}</p>
                            <button
                                type="button"
                                onClick={discoverGaps}
                                disabled={discoveringGaps}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-destructive/90"
                            >
                                <RefreshCw className="size-3.5" /> Retry Discovery
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Action Toolbar */}
                <div className="research-surface flex flex-col gap-4 rounded-3xl border border-purple-500/20 p-5 shadow-lg shadow-purple-500/5 md:flex-row md:items-center md:justify-between md:p-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-teal-600 text-white shadow-md shadow-purple-500/25">
                                <SearchCheck className="size-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-foreground">
                                    Research Gap Discovery &amp; Taxonomy
                                </h2>
                                <p className="text-xs text-muted-foreground md:text-sm">
                                    Extracts evidence-backed gaps categorized into Methodological, Empirical, Theoretical, and Application frontiers.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5">
                        {analyzedPapers.length > 0 && (
                            <button
                                type="button"
                                onClick={discoverGaps}
                                disabled={isDiscoveryRunning}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-teal-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/25 transition-all hover:shadow-lg hover:shadow-purple-500/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isDiscoveryRunning ? (
                                    <>
                                        <RefreshCw className="size-3.5 animate-spin" />
                                        Discovering Gaps...
                                    </>
                                ) : researchGaps.length > 0 ? (
                                    <>
                                        <RefreshCw className="size-3.5" />
                                        Rediscover Gaps
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-3.5" />
                                        Discover Research Gaps
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Running State */}
                {isDiscoveryRunning ? (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 via-background to-background p-8 text-center shadow-lg shadow-purple-500/5 animate-pulse">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-teal-600 text-white shadow-lg shadow-purple-500/30">
                            <RefreshCw className="size-7 animate-spin" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-foreground">Synthesizing Literature &amp; Extracting Research Gaps...</h3>
                        <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                            Analyzing author-stated limitations, cross-study methodology conflicts, and unsolved empirical challenges across your papers. Updating automatically.
                        </p>
                    </div>
                ) : researchGaps.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-background/50 p-8 text-center">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm">
                            <SearchCheck className="size-8" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-foreground">
                            {analyzedPapers.length > 0
                                ? 'Ready for Research Gap Discovery'
                                : 'Awaiting Paper Analysis'}
                        </h3>
                        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                            {analyzedPapers.length > 0
                                ? `You have ${analyzedPapers.length} analyzed papers in this workspace. Discover actionable research gaps backed by anchored citations.`
                                : `Gap discovery requires at least 1 analyzed paper. Currently ${analyzedPapers.length} of ${project.papers.length} papers have finished analysis.`}
                        </p>
                        {analyzedPapers.length > 0 ? (
                            <button
                                type="button"
                                onClick={discoverGaps}
                                disabled={discoveringGaps}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/25 transition hover:shadow-lg hover:brightness-110"
                            >
                                <Sparkles className="size-4" />
                                Discover Research Gaps Now
                            </button>
                        ) : (
                            <Link
                                href={`/projects/${project.id}`}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-xs font-medium transition hover:bg-muted"
                            >
                                Go to Papers &amp; Upload
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Filters Ribbon */}
                        <div className="research-surface flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            {/* Categories */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('all')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                        selectedCategory === 'all'
                                            ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-sm shadow-purple-500/20'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    All Categories ({categoryCounts['all'] ?? 0})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('methodological')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                        selectedCategory === 'methodological'
                                            ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                                            : 'text-sky-700 dark:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20'
                                    }`}
                                >
                                    Methodological ({categoryCounts['methodological'] ?? 0})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('empirical')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                        selectedCategory === 'empirical'
                                            ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                                            : 'text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20'
                                    }`}
                                >
                                    Empirical ({categoryCounts['empirical'] ?? 0})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('theoretical')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                        selectedCategory === 'theoretical'
                                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                                            : 'text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
                                    }`}
                                >
                                    Theoretical ({categoryCounts['theoretical'] ?? 0})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('application')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                        selectedCategory === 'application'
                                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                                            : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                                    }`}
                                >
                                    Application ({categoryCounts['application'] ?? 0})
                                </button>
                            </div>

                            {/* Statuses */}
                            <div className="flex flex-wrap items-center gap-1.5 border-t pt-3 sm:border-t-0 sm:pt-0">
                                {(['all', 'discovered', 'investigating', 'saved', 'dismissed'] as const).map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => setSelectedStatus(st)}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
                                            selectedStatus === st
                                                ? 'bg-foreground text-background shadow-sm'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        {st} ({statusCounts[st] ?? 0})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gap Cards Grid */}
                        {filteredGaps.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                                No research gaps match the selected category and status filters.
                            </div>
                        ) : (
                            <div className="grid gap-5 lg:grid-cols-2">
                                {filteredGaps.map((gap) => {
                                    const actionScore = gap.actionability_score ?? 7;
                                    const actionPercent = Math.min(100, Math.max(10, actionScore * 10));

                                    return (
                                        <article
                                            key={gap.id}
                                            className={`research-surface flex flex-col justify-between rounded-3xl border border-border/80 p-6 shadow-sm transition-all duration-200 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 ${
                                                gap.status === 'dismissed' ? 'opacity-60 hover:opacity-100' : ''
                                            }`}
                                        >
                                            <div className="space-y-4">
                                                {/* Header Badges */}
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold capitalize ${
                                                                gap.category === 'methodological'
                                                                    ? 'border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300'
                                                                    : gap.category === 'empirical'
                                                                    ? 'border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-300'
                                                                    : gap.category === 'theoretical'
                                                                    ? 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                                                                    : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {gap.category}
                                                        </span>
                                                        <span
                                                            className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                                                                gap.potential_impact === 'high'
                                                                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                    : gap.potential_impact === 'medium'
                                                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                                    : 'border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                                            }`}
                                                        >
                                                            Impact: {gap.potential_impact}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2.5">
                                                        {/* Visual Actionability Gauge */}
                                                        <div className="flex items-center gap-1.5" title={`Actionability Score: ${gap.actionability_score}/10`}>
                                                            <span className="text-[11px] font-medium text-muted-foreground">Actionability</span>
                                                            <div className="h-2 w-14 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-purple-600 transition-all duration-300"
                                                                    style={{ width: `${actionPercent}%` }}
                                                                />
                                                            </div>
                                                            <strong className="text-xs font-bold text-foreground">
                                                                {gap.actionability_score}/10
                                                            </strong>
                                                        </div>

                                                        <span className="size-1 rounded-full bg-border" />
                                                        <span className="rounded-md border bg-muted/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                            {gap.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Title & Description */}
                                                <div>
                                                    <h3 className="text-base font-bold leading-snug tracking-tight text-foreground">
                                                        {gap.title}
                                                    </h3>
                                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                                        {gap.description}
                                                    </p>
                                                </div>

                                                {/* Scientific Rationale Callout */}
                                                {gap.rationale && (
                                                    <div className="rounded-2xl border-l-4 border-l-purple-500 border-border/60 bg-purple-500/5 dark:bg-purple-500/10 p-3.5 text-xs leading-relaxed text-foreground/90">
                                                        <p className="font-semibold text-purple-700 dark:text-purple-300">Scientific Rationale</p>
                                                        <p className="mt-1 text-muted-foreground">{gap.rationale}</p>
                                                    </div>
                                                )}

                                                {/* Anchored Evidence Sources */}
                                                {gap.evidence_sources && gap.evidence_sources.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Anchored Paper Citations ({gap.evidence_sources.length})
                                                        </p>
                                                        <div className="space-y-1.5">
                                                            {gap.evidence_sources.map((ev, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="rounded-xl border border-border/70 bg-background/70 p-2.5 text-xs shadow-xs"
                                                                >
                                                                    <Link
                                                                        href={`/papers/${ev.paper_id}`}
                                                                        className="font-semibold text-foreground transition hover:text-purple-600 hover:underline dark:hover:text-purple-400"
                                                                    >
                                                                        📄 {ev.paper_title || getPaperTitle(ev.paper_id)}
                                                                    </Link>
                                                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                                                        {ev.evidence_summary}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Suggested Directions */}
                                                {gap.suggested_directions && gap.suggested_directions.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Suggested Investigation Vectors
                                                        </p>
                                                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                                                            {gap.suggested_directions.map((dir, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                                                        →
                                                                    </span>
                                                                    <span>{dir}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Status Toolbar */}
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {gap.status !== 'saved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateGapStatus(gap.id, 'saved')}
                                                            className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                                                            title="Save gap"
                                                        >
                                                            <Bookmark className="size-3 text-emerald-500" /> Save
                                                        </button>
                                                    )}
                                                    {gap.status !== 'investigating' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateGapStatus(gap.id, 'investigating')}
                                                            className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-600"
                                                            title="Mark under investigation"
                                                        >
                                                            <SearchCheck className="size-3 text-sky-500" /> Investigate
                                                        </button>
                                                    )}
                                                    {gap.status !== 'dismissed' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateGapStatus(gap.id, 'dismissed')}
                                                            className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                                            title="Dismiss gap"
                                                        >
                                                            <X className="size-3" /> Dismiss
                                                        </button>
                                                    )}
                                                    {gap.status !== 'discovered' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateGapStatus(gap.id, 'discovered')}
                                                            className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {gap.novelty_verification?.status === 'processing' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                                            <RefreshCw className="size-3.5 animate-spin" /> Verifying...
                                                        </span>
                                                    ) : gap.novelty_verification?.status === 'completed' ? (
                                                        <Link
                                                            href={`/projects/${project.id}/novelty`}
                                                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs hover:brightness-105 ${
                                                                gap.novelty_verification.novelty_score >= 80
                                                                    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                                                    : gap.novelty_verification.novelty_score >= 50
                                                                    ? 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-400'
                                                                    : 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400'
                                                            }`}
                                                            title="View literature overlap in Novelty Lab"
                                                        >
                                                            <CheckCircle2 className="size-3.5" />
                                                            {gap.novelty_verification.novelty_score}% Novel
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => verifyGap(gap.id)}
                                                            disabled={verifyingGapId === gap.id}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-amber-500/20 transition hover:shadow-md hover:brightness-105"
                                                        >
                                                            <Lightbulb className="size-3.5" /> Verify Novelty
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => generateIdea(gap.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-purple-500/20 transition hover:shadow-md hover:brightness-110"
                                                        title="Formulate publication-ready proposal blueprint"
                                                    >
                                                        <FlaskConical className="size-3.5" /> Draft Blueprint
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        {/* Next Stage Navigation CTA */}
                        <div className="research-surface flex flex-col items-center justify-between gap-4 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-background to-amber-500/5 p-6 shadow-md sm:flex-row">
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    Want to verify originality against external published literature?
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Search Semantic Scholar and arXiv to assess literature saturation and compute objective novelty scores.
                                </p>
                            </div>
                            <Link
                                href={`/projects/${project.id}/novelty`}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/25 transition hover:shadow-lg hover:brightness-105"
                            >
                                <Lightbulb className="size-4" />
                                Go to Novelty Lab <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ProjectGapsPage.layout = { breadcrumbs };
