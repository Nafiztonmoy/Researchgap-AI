<?php

namespace App\Jobs;

use App\Models\ResearchProject;
use App\Services\Ai\AiServiceClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CompareProjectJob implements ShouldQueue
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
            ->with(['papers' => fn ($query) => $query->with('analysis')])
            ->findOrFail($this->projectId);

        $analyzedPapers = $project->papers
            ->filter(fn ($paper) => $paper->analysis !== null)
            ->values();

        if ($analyzedPapers->count() < 2) {
            throw new RuntimeException(
                'Comparison requires at least 2 papers with completed analyses.'
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
                'authors' => $paper->authors ?? [],
                'publication_year' => $paper->publication_year,
                'venue' => $paper->venue,
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
            'papers' => $papersPayload,
        ];

        try {
            $result = $aiService->compareProjectPapers($context);

            DB::transaction(function () use ($project, $analyzedPapers, $result): void {
                $project->comparison()->updateOrCreate(
                    ['research_project_id' => $project->id],
                    [
                        'literature_synthesis' => $result['literature_synthesis'] ?? '',
                        'methodology_landscape' => $result['methodology_landscape'] ?? null,
                        'dataset_landscape' => $result['dataset_landscape'] ?? null,
                        'matrix_rows' => $result['matrix_rows'] ?? [],
                        'tensions_and_contradictions' => $result['tensions_and_contradictions'] ?? [],
                        'shared_limitations' => $result['shared_limitations'] ?? [],
                        'compared_paper_count' => $analyzedPapers->count(),
                        'compared_paper_ids' => $analyzedPapers->pluck('id')->all(),
                        'compared_at' => now(),
                    ]
                );

                $project->update([
                    'comparison_status' => 'completed',
                    'comparison_error' => null,
                ]);
            });
        } catch (\Throwable $exception) {
            $project->update([
                'comparison_status' => 'failed',
                'comparison_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
