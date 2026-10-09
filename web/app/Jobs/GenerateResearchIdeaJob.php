<?php

namespace App\Jobs;

use App\Models\ResearchGap;
use App\Models\ResearchIdea;
use App\Models\ResearchProject;
use App\Services\Ai\AiServiceClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use RuntimeException;
use Throwable;

class GenerateResearchIdeaJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct(
        public string $projectId,
        public ?string $gapId = null,
        public ?string $ideaId = null,
    ) {}

    public function handle(AiServiceClient $aiService): void
    {
        $project = ResearchProject::query()
            ->with('researchGaps')
            ->findOrFail($this->projectId);

        $gap = null;
        if ($this->gapId) {
            $gap = ResearchGap::query()->findOrFail($this->gapId);
        } else {
            $gap = $project->researchGaps()
                ->orderByDesc('actionability_score')
                ->first();
        }

        if (! $gap) {
            throw new RuntimeException(
                'Generating a research idea blueprint requires at least one discovered research gap.'
            );
        }

        if ($this->ideaId) {
            $idea = ResearchIdea::query()->findOrFail($this->ideaId);
            $idea->update([
                'status' => 'processing',
                'error_message' => null,
            ]);
        } else {
            $idea = ResearchIdea::create([
                'research_project_id' => $project->id,
                'research_gap_id' => $gap->id,
                'title' => 'Formulating Blueprint: '.$gap->title,
                'status' => 'processing',
            ]);
        }

        $payload = [
            'project_id' => $project->id,
            'project_title' => $project->title,
            'research_domain' => $project->research_domain,
            'research_question' => $project->research_question,
            'preferred_methodology' => $project->preferred_methodology,
            'gap_id' => $gap->id,
            'gap_title' => $gap->title,
            'gap_category' => $gap->category,
            'gap_description' => $gap->description,
            'gap_rationale' => $gap->rationale,
            'gap_directions' => $gap->suggested_directions ?? [],
            'paper_evidence' => $gap->evidence_sources ?? [],
        ];

        try {
            $result = $aiService->generateResearchIdea($payload);

            $idea->update([
                'title' => $result['title'] ?? ('Blueprint: '.$gap->title),
                'executive_summary' => $result['executive_summary'] ?? '',
                'primary_hypothesis' => $result['primary_hypothesis'] ?? '',
                'hypothesized_mechanisms' => $result['hypothesized_mechanisms'] ?? [],
                'system_architecture_overview' => $result['system_architecture_overview'] ?? '',
                'methodology_phases' => $result['methodology_phases'] ?? [],
                'target_datasets' => $result['target_datasets'] ?? [],
                'baseline_models' => $result['baseline_models'] ?? [],
                'evaluation_metrics' => $result['evaluation_metrics'] ?? [],
                'expected_scientific_contributions' => $result['expected_scientific_contributions'] ?? [],
                'risks_and_mitigations' => $result['risks_and_mitigations'] ?? [],
                'publication_target_venues' => $result['publication_target_venues'] ?? [],
                'status' => 'completed',
                'error_message' => null,
            ]);
        } catch (Throwable $exception) {
            $idea->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
