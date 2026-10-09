<?php

namespace App\Jobs;

use App\Models\GapNoveltyVerification;
use App\Models\ResearchGap;
use App\Services\Ai\AiServiceClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class VerifyGapNoveltyJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct(
        public string $gapId,
    ) {}

    public function handle(AiServiceClient $aiService): void
    {
        $gap = ResearchGap::query()
            ->with('researchProject')
            ->findOrFail($this->gapId);

        $verification = GapNoveltyVerification::updateOrCreate(
            ['research_gap_id' => $gap->id],
            [
                'status' => 'processing',
                'error_message' => null,
            ]
        );

        $payload = [
            'gap_id' => $gap->id,
            'gap_title' => $gap->title,
            'gap_category' => $gap->category,
            'gap_description' => $gap->description,
            'gap_rationale' => $gap->rationale,
            'project_domain' => $gap->researchProject?->research_domain,
            'external_papers' => [],
        ];

        try {
            $result = $aiService->verifyGapNovelty($payload);

            $verification->update([
                'novelty_score' => $result['novelty_score'] ?? 0,
                'novelty_verdict' => $result['novelty_verdict'] ?? 'Moderately Novel',
                'synthesis' => $result['synthesis'] ?? '',
                'overlapping_papers' => $result['overlapping_papers'] ?? [],
                'distinguishing_angles' => $result['distinguishing_angles'] ?? [],
                'potential_pitfalls' => $result['potential_pitfalls'] ?? [],
                'status' => 'completed',
                'error_message' => null,
                'verified_at' => now(),
            ]);
        } catch (Throwable $exception) {
            $verification->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
