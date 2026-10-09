import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    BookOpenText,
    FlaskConical,
    HelpCircle,
    Layers3,
    Lightbulb,
    Pencil,
    RefreshCw,
    SearchCheck,
    Sparkles,
    Trash2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ResearchProject } from '@/types/research';

type ActiveTab = 'overview' | 'comparison' | 'gaps' | 'novelty' | 'ideas';

type Props = {
    project: ResearchProject;
    activeTab: ActiveTab;
};

export function ProjectWorkspaceHeader({ project, activeTab }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);

    const papersCount = project.papers.length;
    const gapsCount = (project.research_gaps ?? []).length;
    const verifiedGapsCount = (project.research_gaps ?? []).filter(
        (g) => g.novelty_verification?.status === 'completed'
    ).length;
    const ideasCount = (project.research_ideas ?? []).length;

    const isComparisonRunning = project.comparison_status === 'generating';
    const isGapDiscoveryRunning = project.gap_discovery_status === 'discovering';

    function deleteProject() {
        router.delete(`/projects/${project.id}`);
    }

    const navTabs = [
        {
            id: 'overview',
            label: 'Overview & Papers',
            href: `/projects/${project.id}`,
            icon: BookOpenText,
            badge: papersCount,
            badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300',
        },
        {
            id: 'comparison',
            label: 'Comparison Matrix',
            href: `/projects/${project.id}/comparison`,
            icon: Layers3,
            badge: isComparisonRunning ? 'Running' : project.comparison ? 'Ready' : null,
            badgeColor: isComparisonRunning
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                : project.comparison
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        },
        {
            id: 'gaps',
            label: 'Research Gaps',
            href: `/projects/${project.id}/gaps`,
            icon: SearchCheck,
            badge: isGapDiscoveryRunning ? 'Finding...' : gapsCount > 0 ? gapsCount : null,
            badgeColor: isGapDiscoveryRunning
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
        },
        {
            id: 'novelty',
            label: 'Novelty Lab',
            href: `/projects/${project.id}/novelty`,
            icon: Lightbulb,
            badge: verifiedGapsCount > 0 ? `${verifiedGapsCount} verified` : null,
            badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
        },
        {
            id: 'ideas',
            label: 'Research Ideas',
            href: `/projects/${project.id}/ideas`,
            icon: FlaskConical,
            badge: ideasCount > 0 ? `${ideasCount} blueprints` : null,
            badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
        },
    ];

    return (
        <header className="space-y-4">
            {/* Top Bar with Breadcrumb and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-background/80 px-2.5 py-1 text-xs transition hover:bg-muted hover:text-foreground shadow-2xs"
                    >
                        <ArrowLeft className="size-3.5" /> Back to Projects
                    </Link>
                    <span>/</span>
                    <span className="max-w-[200px] truncate font-semibold text-foreground md:max-w-md">
                        {project.title}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Link
                        href={`/projects/${project.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-background/90 px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 shadow-2xs"
                    >
                        <Pencil className="size-3.5 text-teal-500" /> Edit Details
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/60 bg-background/90 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40 shadow-2xs"
                    >
                        <Trash2 className="size-3.5" /> Delete
                    </button>
                </div>
            </div>

            {/* Bright Project Hero Surface */}
            <div className="research-surface relative overflow-hidden rounded-2xl border border-teal-100/80 p-5 md:p-7 shadow-xs dark:border-teal-950/50">
                {/* Luminous ambient gradient orbs */}

                <div className="relative flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Live Status Pill with pulsing dot */}
                        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <span className="relative flex size-2 mr-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                            </span>
                            {project.status.toUpperCase()}
                        </span>

                        {project.research_domain && (
                            <span className="inline-flex items-center rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-0.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                                {project.research_domain}
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {project.title}
                        </h1>

                        {project.research_question ? (
                            <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-teal-100/80 bg-teal-50/50 p-3.5 text-xs text-teal-950 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-200 md:text-sm">
                                <HelpCircle className="mt-0.5 size-4 shrink-0 text-teal-600 dark:text-teal-400" />
                                <p className="leading-relaxed">
                                    <strong className="font-semibold text-teal-900 dark:text-teal-100">Research Question: </strong>
                                    {project.research_question}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-2 text-xs text-muted-foreground italic">
                                No specific research question defined yet. Add one in Edit to focus the literature matrix.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Vibrant Stage Navigation Tab Strip */}
            <nav aria-label="Research stages" className="research-surface overflow-x-auto rounded-2xl border border-slate-200/80 p-1.5 shadow-xs dark:border-slate-800">
                <div className="flex min-w-max gap-1.5">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                                }`}
                            >
                                <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                {tab.label}
                                {tab.badge !== null && (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : tab.badgeColor
                                        }`}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Delete Modal */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this research project?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove “{project.title}” and every attached paper, matrix, and discovered gap from the workspace. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setDeleteOpen(false)}
                            className="rounded-xl border px-4 py-2 text-xs font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={deleteProject}
                            className="rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-white hover:bg-destructive/90 shadow-sm"
                        >
                            Delete Project
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
}
