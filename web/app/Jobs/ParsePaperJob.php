<?php

namespace App\Jobs;

use App\Enums\PaperStatus;
use App\Models\Paper;
use App\Services\Ai\AiServiceClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

class ParsePaperJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 180;

    public function __construct(
        public string $paperId,
    ) {}

    public function handle(AiServiceClient $aiService): void
    {
        $paper = Paper::findOrFail($this->paperId);

        $paper->update([
            'processing_status' => PaperStatus::PARSING,
            'processing_error' => null,
        ]);

        try {
            $result = $aiService->parsePaper($paper);

            DB::transaction(function () use ($paper, $result): void {
                $paper->pages()->delete();
                $paper->chunks()->delete();

                $pages = collect($result['pages'] ?? [])
                    ->map(function (array $page): array {
                        return [
                            'page_number' => $page['page_number'],
                            'text' => $page['text'] ?? null,
                            'character_count' => $page['character_count'] ?? 0,
                        ];
                    })
                    ->all();

                if ($pages !== []) {
                    $paper->pages()->createMany($pages);
                }

                $chunks = collect($result['chunks'] ?? [])
                    ->map(function (array $chunk): array {
                        return [
                            'chunk_index' => $chunk['chunk_index'],
                            'page_start' => $chunk['page_start'],
                            'page_end' => $chunk['page_end'],
                            'section_title' => $chunk['section_title'] ?? null,
                            'text' => $chunk['text'],
                            'character_count' => $chunk['character_count'] ?? 0,
                        ];
                    })
                    ->all();

                if ($chunks !== []) {
                    $paper->chunks()->createMany($chunks);
                }

                $metadata = $result['metadata'] ?? [];

                $paper->update([
                    'title' => $metadata['title'] ?? $paper->title,

                    'authors' => ! empty($metadata['authors'])
                        ? $metadata['authors']
                        : $paper->authors,

                    'abstract' => $metadata['abstract'] ?? $paper->abstract,

                    'publication_year' => $metadata['publication_year']
                        ?? $paper->publication_year,

                    'venue' => $metadata['venue']
                        ?? $paper->venue,

                    'doi' => $metadata['doi']
                        ?? $paper->doi,

                    'keywords' => ! empty($metadata['keywords'])
                        ? $metadata['keywords']
                        : $paper->keywords,

                    'page_count' => $result['page_count']
                        ?? count($pages),

                    'processing_status' => PaperStatus::PARSED,
                    'processing_error' => null,
                ]);
            });

            EmbedPaperJob::dispatch($paper->id);
        } catch (Throwable $exception) {
            $paper->update([
                'processing_status' => PaperStatus::FAILED,
                'processing_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
