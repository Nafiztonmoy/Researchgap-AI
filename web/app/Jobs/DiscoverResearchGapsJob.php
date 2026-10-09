<?php

namespace App\Jobs;

use App\Models\ResearchProject;
use App\Services\Ai\AiServiceClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DiscoverResearchGapsJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct(
        public string $projectId,
    ) {}

    public function handle(AiServiceClient $aiService): void
    {
        $project = ResearchProject::query()
            ->with([
                'papers' => fn ($query) => $query->with('analysis'),
                'comparison',
            ])
            ->findOrFail($this->projectId);

        $analyzedPapers = $project->papers
            ->filter(fn ($paper) => $paper->analysis !== null)
            ->values();

        if ($analyzedPapers->isEmpty()) {
            throw new RuntimeException(
                'Gap discovery requires at least one paper with a completed analysis.'
            );
        }

        $papersPayload = $analyzedPapers->map(function ($paper): array {
            $analysis = $paper->analysis;

            $methodologyClaims = collect($analysis->methodology ?? [])
                ->pluck('claim')
                ->all();

            $datasetClaims = collect($analysis->datasets_or_data_sources ?? [])
                ->pluck('claim')
                ->all();

            $findingClaims = collect($analysis->key_findings ?? [])
                ->pluck('claim')
                ->all();

            $authorLimitations = collect($analysis->author_stated_limitations ?? [])
                ->pluck('limitation')
                ->all();

            $inferredLimitations = collect($analysis->ai_inferred_limitations ?? [])
                ->pluck('limitation')
                ->all();

            return [
                'paper_id' => $paper->id,
                'title' => $paper->title ?? $paper->original_filename,
                'research_problem' => $analysis->research_problem['claim'] ?? 'Unspecified',
                'methodology' => $methodologyClaims,
                'datasets' => $datasetClaims,
                'key_findings' => $findingClaims,
                'author_stated_limitations' => $authorLimitations,
                'ai_inferred_limitations' => $inferredLimitations,
            ];
        })->all();

        $context = [
            'project_id' => $project->id,
            'project_title' => $project->title,
            'research_domain' => $project->research_domain,
            'research_question' => $project->research_question,
            'target_population' => $project->target_population,
            'preferred_methodology' => $project->preferred_methodology,
            'literature_synthesis' => $project->comparison?->literature_synthesis,
            'shared_limitations' => $project->comparison?->shared_limitations ?? [],
            'tensions_and_contradictions' => $project->comparison?->tensions_and_contradictions ?? [],
            'papers' => $papersPayload,
        ];

        try {
            $result = $aiService->discoverResearchGaps($context);
            $gaps = $result['gaps'] ?? [];

            DB::transaction(function () use ($project, $gaps): void {
                foreach ($gaps as $gapData) {
                    $existing = $project->researchGaps()
                        ->where('title', $gapData['title'])
                        ->first();

                    if ($existing) {
                        $existing->update([
                            'category' => $gapData['category'],
                            'description' => $gapData['description'],
                            'rationale' => $gapData['rationale'],
                            'evidence_sources' => $gapData['evidence_sources'] ?? [],
                            'potential_impact' => $gapData['potential_impact'],
                            'actionability_score' => $gapData['actionability_score'],
                            'suggested_directions' => $gapData['suggested_directions'] ?? [],
                        ]);
                    } else {
                        $project->researchGaps()->create([
                            'title' => $gapData['title'],
                            'category' => $gapData['category'],
                            'description' => $gapData['description'],
                            'rationale' => $gapData['rationale'],
                            'evidence_sources' => $gapData['evidence_sources'] ?? [],
                            'potential_impact' => $gapData['potential_impact'],
                            'actionability_score' => $gapData['actionability_score'],
                            'suggested_directions' => $gapData['suggested_directions'] ?? [],
                            'status' => 'discovered',
                        ]);
                    }
                }

                $project->update([
                    'gap_discovery_status' => 'completed',
                    'gap_discovery_error' => null,
                ]);
            });
        } catch (\Throwable $exception) {
            $project->update([
                'gap_discovery_status' => 'failed',
                'gap_discovery_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
