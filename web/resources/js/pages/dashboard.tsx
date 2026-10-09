import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpenText,
    CheckCircle2,
    Clock3,
    FileSearch,
    FileText,
    Layers3,
    SearchCheck,
    Lightbulb,
    FolderKanban,
    Plus,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type DashboardStats = {
    projects: number;
    papers: number;
    processing: number;
    readyForAnalysis: number;
};

type RecentProject = {
    id: string;
    title: string;
    research_domain: string | null;
    status: string;
    papers_count: number;
    updated_at: string;
};

type RecentPaper = {
    id: string;
    title: string | null;
    original_filename: string;
    processing_status: string;
    created_at: string;
    research_project: {
        id: string;
        title: string;
    };
};

type Props = {
    stats: DashboardStats;
    recentProjects: RecentProject[];
    recentPapers: RecentPaper[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

function formatStatus(status: string) {
    return status
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCleanPaperTitle(title: string | null, filename: string): string {
    if (!title || !title.trim()) return filename;
    const trimmed = title.trim();
    if (
        trimmed.startsWith('eprints@') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.toLowerCase().includes('whiterose.ac.uk')
    ) {
        return filename.replace(/\.pdf$/i, '');
    }
    return trimmed;
}

export default function Dashboard({ stats, recentProjects, recentPapers }: Props) {
    const statCards = [
        {
            label: 'Research projects',
            value: stats.projects,
            detail: 'Active literature workspaces',
            icon: FolderKanban,
        },
        {
            label: 'Papers collected',
            value: stats.papers,
            detail: 'Across all your projects',
            icon: BookOpenText,
        },
        {
            label: 'Ready for analysis',
            value: stats.readyForAnalysis,
            detail: 'Papers awaiting evidence extraction',
            icon: FileSearch,
        },
        {
            label: 'Processing now',
            value: stats.processing,
            detail: 'Queued parsing or analysis jobs',
            icon: Clock3,
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3 animate-enter">
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Your research workspace</p>
                        <h1 className="text-3xl font-semibold tracking-tight">Research overview</h1>
                        <p className="mt-2 text-sm text-muted-foreground">A clearer view of your literature. A stronger starting point for your next idea.</p>
                    </div>
                    <Link href="/projects/create" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                        <Plus className="size-4" /> New project
                    </Link>
                </div>

                <section className="dashboard-hero research-grid grid items-center gap-8 overflow-hidden rounded-2xl border p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr] animate-enter">
                    <div>
                        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                            <Sparkles className="size-4" /> From literature to possibility
                        </div>
                        <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">Read between the papers.<br />Find your next direction.</h2>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">Bring your papers together, compare the evidence, and explore research gaps with a clear path back to the source.</p>
                        <Link href="/projects" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3">Explore your projects <ArrowRight className="size-4" /></Link>
                    </div>
                    <div className="workspace-map rounded-xl border p-5">
                        <div className="mb-5 flex items-center justify-between border-b pb-3">
                            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">The research journey</span>
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">Evidence first</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: BookOpenText, label: 'Collect papers', detail: 'Build your literature base' },
                                { icon: Layers3, label: 'Compare evidence', detail: 'Connect methods & findings' },
                                { icon: SearchCheck, label: 'Discover gaps', detail: 'Spot unexplored directions' },
                                { icon: Lightbulb, label: 'Verify novelty', detail: 'Check related research' },
                            ].map(({ icon: Icon, label, detail }, index) => (
                                <div key={label} className="rounded-lg bg-muted/60 p-3">
                                    <div className="mb-3 flex items-center justify-between"><Icon className="size-5 text-primary" /><span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span></div>
                                    <p className="text-xs font-semibold">{label}</p>
                                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-enter-delay-1">
                    {statCards.map(({ label, value, detail, icon: Icon }) => (
                        <div
                            key={label}
                            className="research-surface group rounded-xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/50 text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="size-5" />
                                </div>
                                <span className="text-4xl font-semibold tracking-tight tabular-nums">{value}</span>
                            </div>
                            <p className="mt-4 text-sm font-medium">{label}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] animate-enter-delay-2">
                    <section className="research-surface min-w-0 overflow-hidden rounded-2xl border">
                        <div className="flex items-center justify-between border-b p-5">
                            <div>
                                <h2 className="font-semibold text-foreground">Recent projects</h2>
                                <p className="mt-1 text-xs text-muted-foreground">Continue where you left off.</p>
                            </div>
                            <Link href="/projects" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
                                View all
                            </Link>
                        </div>

                        {recentProjects.length === 0 ? (
                            <div className="p-8 text-center">
                                <FolderKanban className="mx-auto size-9 text-muted-foreground" />
                                <p className="mt-3 font-medium">No projects yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">Create a research workspace to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {recentProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/projects/${project.id}`}
                                        className="group flex items-center justify-between gap-4 p-5 transition hover:bg-muted/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-medium group-hover:underline group-hover:underline-offset-4">
                                                {project.title}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {project.research_domain || 'Research domain not specified'}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-medium">{project.papers_count} papers</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(project.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="research-surface min-w-0 overflow-hidden rounded-2xl border">
                        <div className="flex items-center justify-between border-b p-5">
                            <div className="flex items-center gap-2.5">
                                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="size-4" />
                                </span>
                                <div>
                                    <h2 className="font-semibold text-foreground">Latest papers</h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">Most recently uploaded literature.</p>
                                </div>
                            </div>
                            <Link href="/papers" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
                                View all
                            </Link>
                        </div>

                        {recentPapers.length === 0 ? (
                            <div className="p-8 text-center">
                                <BookOpenText className="mx-auto size-9 text-muted-foreground" />
                                <p className="mt-3 font-medium">No papers uploaded</p>
                                <p className="mt-1 text-sm text-muted-foreground">Open a project and add your first PDF.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {recentPapers.map((paper) => {
                                    const displayTitle = getCleanPaperTitle(paper.title, paper.original_filename);

                                    return (
                                        <div
                                            key={paper.id}
                                            className="group flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:text-primary transition">
                                                    <FileText className="size-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        href={`/papers/${paper.id}`}
                                                        className="block truncate text-sm font-semibold text-foreground transition group-hover:text-primary hover:underline hover:underline-offset-2"
                                                        title={displayTitle}
                                                    >
                                                        {displayTitle}
                                                    </Link>

                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                                        <Link
                                                            href={`/projects/${paper.research_project.id}`}
                                                            className="truncate hover:text-foreground hover:underline transition"
                                                            title={`Project: ${paper.research_project.title}`}
                                                        >
                                                            {paper.research_project.title}
                                                        </Link>
                                                        <span className="text-muted-foreground/40 shrink-0">•</span>
                                                        <span className="shrink-0 text-[11px]">
                                                            {new Date(paper.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-2">
                                                {paper.processing_status === 'completed' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle2 className="size-3" />
                                                        Completed
                                                    </span>
                                                ) : paper.processing_status === 'failed' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-semibold text-destructive">
                                                        <AlertCircle className="size-3" />
                                                        Failed
                                                    </span>
                                                ) : paper.processing_status === 'uploaded' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                                                        Uploaded
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                                        <RefreshCw className="size-3 animate-spin" />
                                                        {formatStatus(paper.processing_status)}
                                                    </span>
                                                )}

                                                <Link
                                                    href={`/papers/${paper.id}`}
                                                    className="p-2 text-muted-foreground transition hover:text-foreground"
                                                    aria-label={`Open ${displayTitle}`}
                                                    title="Open paper"
                                                >
                                                    <ArrowRight className="size-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed p-5 animate-enter-delay-3">
                    <div className="flex items-start gap-3">
                        <FileSearch className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div><p className="text-sm font-semibold">Every direction starts with evidence.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Review the source papers and verify novelty before choosing a research direction.</p></div>
                    </div>
                    <Link href="/papers" className="inline-flex items-center gap-2 text-xs font-semibold text-primary">Open paper library <ArrowRight className="size-4" /></Link>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = { breadcrumbs };
