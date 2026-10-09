import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { NoveltyLabSection } from '@/components/novelty-lab-section';
import { ProjectWorkspaceHeader } from '@/components/project-workspace-header';
import type { BreadcrumbItem } from '@/types';
import type { ResearchProject } from '@/types/research';

type Props = { project: ResearchProject };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
    { title: 'Novelty Lab', href: '#' },
];

export default function ProjectNoveltyPage({ project }: Props) {
    const [verifyingGapId, setVerifyingGapId] = useState<string | null>(null);

    const researchGaps = project.research_gaps ?? [];
    const hasVerifyingGap = researchGaps.some(
        (g) => g.novelty_verification?.status === 'processing' || g.novelty_verification?.status === 'pending'
    );
    const isRunning = verifyingGapId !== null || hasVerifyingGap;

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            router.reload({ only: ['project'] });
        }, 3000);

        return () => clearInterval(interval);
    }, [isRunning]);

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

    function draftIdea(gapId: string) {
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

    return (
        <>
            <Head title={`Novelty Lab - ${project.title}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <ProjectWorkspaceHeader project={project} activeTab="novelty" />

                <NoveltyLabSection
                    project={project}
                    onVerifyGap={verifyGap}
                    verifyingGapId={verifyingGapId}
                    onDraftIdea={draftIdea}
                />

                {/* Next Stage Navigation CTA */}
                <div className="research-surface flex flex-col items-center justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-background to-emerald-500/5 p-6 shadow-md sm:flex-row">
                    <div>
                        <p className="text-sm font-bold text-foreground">
                            Ready to formulate a publication-grade blueprint?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Transform verified gaps into structured proposals with formal hypotheses, methodology roadmaps, benchmarks, and risk matrices.
                        </p>
                    </div>
                    <Link
                        href={`/projects/${project.id}/ideas`}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:brightness-105"
                    >
                        <FlaskConical className="size-4" />
                        Go to Research Ideas Lab <ArrowRight className="size-3.5" />
                    </Link>
                </div>
            </div>
        </>
    );
}

ProjectNoveltyPage.layout = { breadcrumbs };
