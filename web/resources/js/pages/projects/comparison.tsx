import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Layers3,
    Quote,
    RefreshCw,
    SearchCheck,
    Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProjectWorkspaceHeader } from '@/components/project-workspace-header';
import type { BreadcrumbItem } from '@/types';
import type { ResearchProject } from '@/types/research';

type Props = { project: ResearchProject };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
    { title: 'Comparison Matrix', href: '#' },
];

export default function ProjectComparisonPage({ project }: Props) {
    const [generating, setGenerating] = useState(false);

    const analyzedPapers = project.papers.filter((p) => p.processing_status === 'completed');
    const isRunning = generating || project.comparison_status === 'generating';

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

    function generateComparison() {
        if (analyzedPapers.length < 2) {
            toast.error('At least 2 analyzed papers are required for cross-paper comparison.');
            return;
        }

        setGenerating(true);
        router.post(
            `/projects/${project.id}/comparison/generate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Cross-paper comparison matrix queued for synthesis.');
                    setGenerating(false);
                },
                onError: () => {
                    toast.error('Failed to trigger comparison matrix.');
                    setGenerating(false);
                },
            }
        );
    }

    const comparedPapers = project.papers.filter((p) =>
        project.comparison?.compared_paper_ids?.includes(p.id)
    );
    const papersInComparison = comparedPapers.length > 0 ? comparedPapers : analyzedPapers;

    return (
        <>
            <Head title={`Comparison Matrix - ${project.title}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 animate-enter">
                <ProjectWorkspaceHeader project={project} activeTab="comparison" />

                {/* Error Banner */}
                {project.comparison_error && (
                    <div className="flex items-start gap-3.5 rounded-2xl border border-rose-300/80 bg-rose-50/80 p-4.5 text-sm text-rose-900 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" />
                        <div className="flex-1">
                            <p className="font-bold">Cross-paper synthesis encountered an error</p>
                            <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{project.comparison_error}</p>
                            <button
                                type="button"
                                onClick={generateComparison}
                                disabled={generating}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-500"
                            >
                                <RefreshCw className="size-3.5" /> Retry Synthesis
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Action Toolbar */}
                <div className="research-surface flex flex-col gap-4 rounded-3xl border border-slate-200/80 p-5 md:flex-row md:items-center md:justify-between md:p-6 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                <Layers3 className="size-4.5" />
                            </span>
                            <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                                Comparative Matrix &amp; Cross-Paper Synthesis
                            </h2>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                            Extracts multi-paper comparative tables, contrasts research methodologies, and detects scientific tensions across literature.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {analyzedPapers.length >= 2 && (
                            <button
                                type="button"
                                onClick={generateComparison}
                                disabled={isRunning}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isRunning ? (
                                    <>
                                        <RefreshCw className="size-3.5 animate-spin" />
                                        Synthesizing Matrix...
                                    </>
                                ) : project.comparison ? (
                                    <>
                                        <RefreshCw className="size-3.5" />
                                        Regenerate Matrix
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-3.5" />
                                        Generate Comparison Matrix
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Running State */}
                {isRunning ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-sky-50/50 p-8 text-center animate-pulse dark:border-teal-950/60 dark:from-slate-900/40 dark:to-slate-900/40">
                        <RefreshCw className="size-10 animate-spin text-teal-600 dark:text-teal-400" />
                        <h3 className="mt-4 text-base font-bold text-foreground">
                            Synthesizing Literature Across {analyzedPapers.length} Papers...
                        </h3>
                        <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
                            Analyzing methodologies, comparing findings, and discovering recurring limitations. Updating automatically when finished.
                        </p>
                    </div>
                ) : !project.comparison ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 shadow-xs dark:border-teal-950 dark:bg-teal-950/50">
                            <Layers3 className="size-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-foreground">
                            {analyzedPapers.length >= 2
                                ? 'Ready for Cross-Paper Synthesis'
                                : 'Awaiting Paper Analyses'}
                        </h3>
                        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                            {analyzedPapers.length >= 2
                                ? `You have ${analyzedPapers.length} analyzed papers ready in this workspace. Generate the comparative matrix to reveal consensus, methodological tradeoffs, and contradictions.`
                                : `Cross-paper synthesis requires at least 2 analyzed papers. Currently ${analyzedPapers.length} of ${project.papers.length} papers have finished analysis.`}
                        </p>
                        {analyzedPapers.length >= 2 ? (
                            <button
                                type="button"
                                onClick={generateComparison}
                                disabled={generating}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
                            >
                                <Sparkles className="size-4" />
                                Generate Cross-Paper Matrix Now
                            </button>
                        ) : (
                            <Link
                                href={`/projects/${project.id}`}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-background px-4 py-2 text-xs font-medium transition hover:bg-muted"
                            >
                                Go to Papers &amp; Upload
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Literature Synthesis Summary Card */}
                        <div className="research-surface rounded-3xl border border-teal-100/80 p-5 md:p-7 shadow-xs dark:border-teal-950/50">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                    📖 Literature Synthesis Overview
                                </h3>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    Synthesized across {papersInComparison.length} papers
                                </span>
                            </div>
                            <p className="mt-3.5 whitespace-pre-line text-xs leading-relaxed text-foreground/90 md:text-sm">
                                {project.comparison.literature_synthesis}
                            </p>
                        </div>

                        {/* Methodology & Dataset Landscapes */}
                        {(project.comparison.methodology_landscape || project.comparison.dataset_landscape) && (
                            <div className="grid gap-5 md:grid-cols-2">
                                {project.comparison.methodology_landscape && (
                                    <div className="research-surface rounded-2xl border border-sky-100/80 p-5 dark:border-sky-950/50">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                            ⚙️ Methodology Landscape
                                        </h4>
                                        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground md:text-sm">
                                            {project.comparison.methodology_landscape}
                                        </p>
                                    </div>
                                )}
                                {project.comparison.dataset_landscape && (
                                    <div className="research-surface rounded-2xl border border-purple-100/80 p-5 dark:border-purple-950/50">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                            📊 Dataset Landscape
                                        </h4>
                                        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground md:text-sm">
                                            {project.comparison.dataset_landscape}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Side-by-Side Comparative Matrix Table */}
                        {project.comparison.matrix_rows && project.comparison.matrix_rows.length > 0 && (
                            <div className="research-surface overflow-hidden rounded-3xl border border-slate-200/80 shadow-xs dark:border-slate-800">
                                <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-5 dark:border-slate-800 dark:from-slate-900/50 dark:to-slate-900/50">
                                    <h3 className="text-sm font-bold tracking-tight text-foreground md:text-base">
                                        Side-by-Side Comparative Matrix ({papersInComparison.length} papers)
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Directly contrasts problem formulation, methodologies, datasets, findings, and limitations across analyzed papers.
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200/80 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-900/90">
                                                <th className="sticky left-0 z-10 w-44 bg-slate-50/95 p-4 font-bold text-foreground backdrop-blur md:w-56 dark:bg-slate-900/95">
                                                    Dimension
                                                </th>
                                                {papersInComparison.map((paper) => (
                                                    <th
                                                        key={paper.id}
                                                        className="min-w-64 max-w-xs p-4 font-bold text-foreground"
                                                    >
                                                        <Link
                                                            href={`/papers/${paper.id}`}
                                                            className="hover:text-teal-600 dark:hover:text-teal-400 hover:underline line-clamp-2"
                                                        >
                                                            {paper.title || paper.original_filename}
                                                        </Link>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {project.comparison.matrix_rows.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-teal-50/20 transition dark:hover:bg-slate-800/20">
                                                    <td className="sticky left-0 z-10 bg-background/95 p-4 font-semibold text-foreground backdrop-blur">
                                                        {row.dimension}
                                                    </td>
                                                    {papersInComparison.map((paper) => (
                                                        <td
                                                            key={paper.id}
                                                            className="p-4 leading-relaxed text-muted-foreground align-top"
                                                        >
                                                            {row.values[paper.id] || (
                                                                <span className="text-muted-foreground/40">—</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Literature Contradictions & Tensions */}
                        {project.comparison.tensions_and_contradictions &&
                            project.comparison.tensions_and_contradictions.length > 0 && (
                                <div className="space-y-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                                            <AlertTriangle className="size-4" />
                                        </span>
                                        <h3 className="text-sm font-bold tracking-tight text-foreground md:text-base">
                                            Literature Tensions &amp; Scientific Contradictions ({project.comparison.tensions_and_contradictions.length})
                                        </h3>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {project.comparison.tensions_and_contradictions.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="research-surface rounded-2xl border border-rose-200/80 p-4.5 text-xs space-y-3.5 dark:border-rose-900/50"
                                            >
                                                <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                                                    Contradiction: {item.topic}
                                                </span>

                                                <div className="grid gap-2.5 sm:grid-cols-2">
                                                    <div className="rounded-xl border border-slate-200/80 bg-background/80 p-3 dark:border-slate-800">
                                                        <p className="font-bold text-foreground line-clamp-1">
                                                            {item.paper_a_title}
                                                        </p>
                                                        <p className="mt-1.5 text-[11px] italic text-muted-foreground">
                                                            "{item.paper_a_claim}"
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200/80 bg-background/80 p-3 dark:border-slate-800">
                                                        <p className="font-bold text-foreground line-clamp-1">
                                                            {item.paper_b_title}
                                                        </p>
                                                        <p className="mt-1.5 text-[11px] italic text-muted-foreground">
                                                            "{item.paper_b_claim}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-foreground/90 dark:bg-slate-900/50">
                                                    <strong className="text-teal-600 dark:text-teal-400">Scientific Resolution: </strong>
                                                    {item.analysis}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Shared Limitations Across Corpus */}
                        {project.comparison.shared_limitations &&
                            project.comparison.shared_limitations.length > 0 && (
                                <div className="space-y-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                                            <Layers3 className="size-4" />
                                        </span>
                                        <h3 className="text-sm font-bold tracking-tight text-foreground md:text-base">
                                            Shared Limitations Across Corpus ({project.comparison.shared_limitations.length})
                                        </h3>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {project.comparison.shared_limitations.map((lim, idx) => (
                                            <div
                                                key={idx}
                                                className="research-surface flex flex-col justify-between rounded-2xl border border-amber-200/80 p-4.5 text-xs dark:border-amber-900/50"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-bold text-foreground">
                                                            {lim.theme}
                                                        </span>
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                                            {lim.gap_potential} Potential
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                                                        {lim.description}
                                                    </p>
                                                </div>

                                                <div className="mt-4 border-t border-slate-100 pt-2 text-[10px] font-medium text-muted-foreground dark:border-slate-800">
                                                    Affects {lim.affected_paper_ids.length} papers in current corpus
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Next Stage Navigation CTA */}
                        <div className="research-surface flex flex-col items-center justify-between gap-4 rounded-3xl border border-teal-100/80 bg-gradient-to-r from-teal-50/50 via-white to-purple-50/50 p-6 sm:flex-row dark:border-teal-950/50 dark:from-slate-900/40 dark:to-slate-900/40">
                            <div>
                                <p className="text-sm font-bold text-foreground md:text-base">
                                    Ready to uncover research gap opportunities?
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Derive categorized, evidence-grounded research gaps from this comparison matrix.
                                </p>
                            </div>
                            <Link
                                href={`/projects/${project.id}/gaps`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
                            >
                                <SearchCheck className="size-4" />
                                Go to Research Gaps Lab <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ProjectComparisonPage.layout = { breadcrumbs };
