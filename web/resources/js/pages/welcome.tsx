import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenCheck,
    FileSearch,
    GitCompareArrows,
    Lightbulb,
    SearchCheck,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

const steps = [
    { icon: BookOpenCheck, title: 'Collect relevant papers', text: 'Create a focused project and keep related literature together.' },
    { icon: FileSearch, title: 'Extract structured evidence', text: 'Methods, datasets, findings, limitations, and page-linked citations.' },
    { icon: GitCompareArrows, title: 'Compare the literature', text: 'Surface recurring limitations, contradictions, trade-offs, and missing dimensions.' },
    { icon: SearchCheck, title: 'Verify candidate novelty', text: 'Check related external work before treating any direction as underexplored.' },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="ResearchGap AI" />
            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <AppLogoIcon className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold tracking-tight">ResearchGap AI</p>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Evidence workspace</p>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link href={dashboard()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                                    Dashboard <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Log in</Link>
                                    <Link href={register()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">Create account</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="research-grid relative overflow-hidden border-b">
                        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/70 to-background" />
                        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-28">
                            <div className="animate-enter">
                                <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                                    <Sparkles className="size-3.5" />
                                    Research direction, grounded in evidence
                                </div>
                                <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                                    The next great idea starts between the papers.
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                                    Upload related academic papers, structure what each study actually did, compare limitations and trade-offs, then build candidate research gaps that remain traceable to evidence.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link href={auth.user ? dashboard() : register()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                                        {auth.user ? 'Open dashboard' : 'Start a research project'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <a href="#workflow" className="inline-flex items-center gap-2 rounded-xl border bg-background/80 px-5 py-3 text-sm font-medium transition hover:bg-muted">
                                        See the workflow
                                    </a>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Evidence-linked claims</span>
                                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Explicit vs inferred limitations</span>
                                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Cautious novelty language</span>
                                </div>
                            </div>

                            <div className="animate-enter-delay-2">
                                <div className="research-surface relative overflow-hidden rounded-3xl border p-4 shadow-2xl shadow-black/5">
                                    <div className="rounded-2xl border bg-background p-5">
                                        <div className="flex items-center justify-between gap-3 border-b pb-4">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Illustrative candidate gap</p>
                                                <p className="mt-1 font-semibold">Limited low-resource language evaluation</p>
                                            </div>
                                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">Unverified</span>
                                        </div>
                                        <div className="mt-5 space-y-4">
                                            <EvidenceLine label="Observed" value="12 of 15 papers evaluate English-language datasets." />
                                            <EvidenceLine label="Inference" value="Low-resource language evaluation appears limited in this collection." />
                                            <EvidenceLine label="Possibility" value="Bengali cross-lingual transfer could be worth verifying against external literature." />
                                        </div>
                                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                            <Metric label="Evidence" value="12 papers" />
                                            <Metric label="Confidence" value="High" />
                                            <Metric label="Novelty" value="Needs check" />
                                        </div>
                                    </div>
                                    <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/5 blur-3xl" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="workflow" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
                        <div className="max-w-2xl animate-enter">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight">A research tool, not a generic PDF chatbot.</h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">The product separates observed facts, supported inference, and speculative directions before novelty verification.</p>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {steps.map(({ icon: Icon, title, text }, index) => (
                                <div key={title} className="research-surface group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ animationDelay: `${index * 70}ms` }}>
                                    <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/40 transition group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-5 font-semibold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="border-y bg-muted/20">
                        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:px-6 lg:grid-cols-3">
                            <Principle icon={ShieldCheck} title="Evidence over eloquence" text="Major claims should point back to a paper, page, section, and short excerpt." />
                            <Principle icon={Lightbulb} title="Candidate novelty, not certainty" text="The system should say underexplored, limited evidence found, or needs verification — never 100% novel." />
                            <Principle icon={GitCompareArrows} title="Cross-paper reasoning" text="The useful signal appears when methods, datasets, limitations, contradictions, and trade-offs are compared together." />
                        </div>
                    </section>

                    <section className="mx-auto max-w-5xl px-4 py-20 text-center md:px-6">
                        <h2 className="text-3xl font-semibold tracking-tight">Build a defensible direction before you build the experiment.</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Start with project organization and protected paper collection now; structured AI analysis is the next implementation stage.</p>
                        <Link href={auth.user ? dashboard() : register()} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm">
                            {auth.user ? 'Continue to dashboard' : 'Create your workspace'}
                            <ArrowRight className="size-4" />
                        </Link>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
                        <span>ResearchGap AI</span>
                        <span>Final novelty judgment belongs to the researcher.</span>
                    </div>
                </footer>
            </div>
        </>
    );
}

function EvidenceLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 sm:grid-cols-[90px_1fr] sm:gap-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="text-sm leading-5">{value}</span>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return <div className="rounded-xl bg-muted/40 p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function Principle({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
    return <div className="rounded-2xl border bg-background p-5"><Icon className="size-5" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}
