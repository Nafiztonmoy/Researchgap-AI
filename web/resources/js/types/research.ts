export type Paper = {
    id: string;
    title: string | null;
    original_filename: string;
    file_size: number;
    mime_type: string;
    processing_status: string;
    processing_error: string | null;
    page_count: number | null;
    created_at: string;
    analysis?: Record<string, unknown> | null;
};

export type MatrixRow = {
    dimension: string;
    values: Record<string, string>;
};

export type ContradictionOrTension = {
    topic: string;
    paper_a_id: string;
    paper_a_title: string;
    paper_a_claim: string;
    paper_b_id: string;
    paper_b_title: string;
    paper_b_claim: string;
    analysis: string;
};

export type SharedLimitation = {
    theme: string;
    description: string;
    affected_paper_ids: string[];
    gap_potential: string;
};

export type ProjectComparison = {
    id: string;
    literature_synthesis: string;
    methodology_landscape: string | null;
    dataset_landscape: string | null;
    matrix_rows: MatrixRow[];
    tensions_and_contradictions: ContradictionOrTension[];
    shared_limitations: SharedLimitation[];
    compared_paper_count: number;
    compared_paper_ids: string[];
    compared_at: string;
};

export type GapPaperEvidence = {
    paper_id: string;
    paper_title: string;
    evidence_summary: string;
};

export type OverlappingPaper = {
    title: string;
    authors: string[];
    year: number | null;
    venue: string | null;
    citation_count: number;
    abstract: string | null;
    url: string | null;
    relevance_explanation: string;
    overlap_level: 'high' | 'moderate' | 'low' | 'minimal';
};

export type GapNoveltyVerification = {
    id: string;
    research_gap_id: string;
    novelty_score: number;
    novelty_verdict: 'Highly Novel' | 'Moderately Novel' | 'High Literature Saturation' | string;
    synthesis: string | null;
    overlapping_papers: OverlappingPaper[];
    distinguishing_angles: string[];
    potential_pitfalls: string[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message: string | null;
    verified_at: string | null;
};

export type ResearchGap = {
    id: string;
    research_project_id: string;
    title: string;
    category: 'methodological' | 'empirical' | 'theoretical' | 'application';
    description: string;
    rationale: string;
    evidence_sources: GapPaperEvidence[];
    potential_impact: 'high' | 'medium' | 'exploratory';
    actionability_score: number;
    suggested_directions: string[];
    status: 'discovered' | 'investigating' | 'saved' | 'dismissed';
    notes: string | null;
    created_at: string;
    novelty_verification?: GapNoveltyVerification | null;
};

export type MethodologyPhase = {
    phase: string;
    title: string;
    description: string;
    key_techniques: string[];
};

export type TargetDataset = {
    name: string;
    description: string;
    availability: string;
    purpose: string;
};

export type BaselineModel = {
    model_name: string;
    description: string;
    expected_weakness: string;
};

export type EvaluationMetric = {
    metric_name: string;
    measurement_goal: string;
    target_threshold: string;
};

export type RiskAndMitigation = {
    risk: string;
    severity: 'low' | 'medium' | 'high';
    mitigation_strategy: string;
};

export type ResearchIdea = {
    id: string;
    research_project_id: string;
    research_gap_id: string | null;
    title: string;
    executive_summary: string | null;
    primary_hypothesis: string | null;
    hypothesized_mechanisms: string[] | null;
    system_architecture_overview: string | null;
    methodology_phases: MethodologyPhase[] | null;
    target_datasets: TargetDataset[] | null;
    baseline_models: BaselineModel[] | null;
    evaluation_metrics: EvaluationMetric[] | null;
    expected_scientific_contributions: string[] | null;
    risks_and_mitigations: RiskAndMitigation[] | null;
    publication_target_venues: string[] | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message: string | null;
    created_at: string;
    research_gap?: ResearchGap | null;
};

export type ResearchProject = {
    id: string;
    title: string;
    research_domain: string | null;
    research_question: string | null;
    description: string | null;
    target_population: string | null;
    keywords: string[] | null;
    preferred_methodology: string | null;
    notes: string | null;
    status: string;
    comparison_status?: string;
    comparison_error?: string | null;
    gap_discovery_status?: string;
    gap_discovery_error?: string | null;
    papers: Paper[];
    comparison?: ProjectComparison | null;
    research_gaps?: ResearchGap[];
    research_ideas?: ResearchIdea[];
};
