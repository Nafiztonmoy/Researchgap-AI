import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, BookOpenCheck, Lightbulb, Plus } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
    { title: 'Create Project', href: '/projects/create' },
];

type ProjectForm = {
    title: string;
    research_domain: string;
    research_question: string;
    description: string;
    target_population: string;
    keywords: string;
    preferred_methodology: string;
    notes: string;
};

const fieldClass =
    'w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/15';

export default function CreateProject() {
    const { data, setData, post, processing, errors, transform } = useForm<ProjectForm>({
        title: '',
        research_domain: '',
        research_question: '',
        description: '',
        target_population: '',
        keywords: '',
        preferred_methodology: '',
        notes: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        transform((formData) => ({
            ...formData,
            keywords: formData.keywords
                .split(',')
                .map((keyword) => keyword.trim())
                .filter(Boolean),
        }));

        post('/projects');
    }

    return (
        <>
            <Head title="Create Research Project" />

            <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
                <Link
                    href="/projects"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground animate-enter"
                >
                    <ArrowLeft className="size-4" />
                    Back to projects
                </Link>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <main className="research-surface rounded-2xl border p-5 md:p-7 animate-enter-delay-1">
                        <div className="mb-7">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                                <Plus className="size-3.5" />
                                New evidence workspace
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Define the research problem first</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                A focused project description gives later paper comparison and gap analysis a clear frame of reference.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Project title" error={errors.title} required className="md:col-span-2">
                                    <input
                                        autoFocus
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Bengali Fake News Detection"
                                        className={fieldClass}
                                    />
                                </Field>

                                <Field label="Research domain" error={errors.research_domain}>
                                    <input
                                        value={data.research_domain}
                                        onChange={(e) => setData('research_domain', e.target.value)}
                                        placeholder="Natural Language Processing"
                                        className={fieldClass}
                                    />
                                </Field>

                                <Field label="Target population / domain" error={errors.target_population}>
                                    <input
                                        value={data.target_population}
                                        onChange={(e) => setData('target_population', e.target.value)}
                                        placeholder="Bengali social media"
                                        className={fieldClass}
                                    />
                                </Field>

                                <Field label="Research question" error={errors.research_question} className="md:col-span-2">
                                    <textarea
                                        rows={4}
                                        value={data.research_question}
                                        onChange={(e) => setData('research_question', e.target.value)}
                                        placeholder="How can fake news detection be improved for low-resource Bengali social media text?"
                                        className={fieldClass}
                                    />
                                </Field>

                                <Field label="Project description" error={errors.description} className="md:col-span-2">
                                    <textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="What literature are you collecting, and what decision should this project help you make?"
                                        className={fieldClass}
                                    />
                                </Field>

                                <Field label="Keywords" error={errors.keywords} className="md:col-span-2" hint="Separate keywords with commas.">
                                    <input
                                        value={data.keywords}
                                        onChange={(e) => setData('keywords', e.target.value)}
                                        placeholder="Bengali, misinformation, transformer, low-resource NLP"
                                        className={fieldClass}
                                    />
                                </Field>

                                <Field label="Preferred methodology" error={errors.preferred_methodology}>
                                    <textarea
                                        rows={4}
                                        value={data.preferred_methodology}
                                        onChange={(e) => setData('preferred_methodology', e.target.value)}
                                        placeholder="Optional methodological preference"
                                        className={fieldClass}
                                    />
                                </Field>

                                <Field label="Private notes" error={errors.notes}>
                                    <textarea
                                        rows={4}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Supervisor comments, constraints, deadlines..."
                                        className={fieldClass}
                                    />
                                </Field>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href="/projects"
                                    className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <Plus className="size-4" />
                                    {processing ? 'Creating project...' : 'Create project'}
                                </button>
                            </div>
                        </form>
                    </main>

                    <aside className="space-y-4 animate-enter-delay-2">
                        <div className="research-surface rounded-2xl border p-5">
                            <BookOpenCheck className="size-5" />
                            <h2 className="mt-4 font-semibold">What belongs here?</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Keep one closely related literature problem per project. You can upload multiple papers after creation.
                            </p>
                        </div>
                        <div className="research-surface rounded-2xl border p-5">
                            <Lightbulb className="size-5" />
                            <h2 className="mt-4 font-semibold">You do not need a novelty yet</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                The goal is to collect evidence first. Candidate gaps and novelty directions come after structured comparison.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

function Field({
    label,
    error,
    hint,
    required = false,
    className = '',
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={`block space-y-2 ${className}`}>
            <span className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
            </span>
            {children}
            {hint && !error && <span className="block text-xs text-muted-foreground">{hint}</span>}
            {error && <span className="block text-xs font-medium text-destructive">{error}</span>}
        </label>
    );
}

CreateProject.layout = { breadcrumbs };
