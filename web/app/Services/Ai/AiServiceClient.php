<?php

namespace App\Services\Ai;

use App\Models\Paper;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class AiServiceClient
{
    public function health(): array
    {
        return Http::baseUrl(
            rtrim(config('ai.url'), '/')
        )
            ->acceptJson()
            ->timeout(10)
            ->get('/health')
            ->throw()
            ->json();
    }

    public function parsePaper(Paper $paper): array
    {
        $disk = Storage::disk($paper->file_disk);

        if (! $disk->exists($paper->file_path)) {
            throw new RuntimeException(
                "Paper file not found: {$paper->file_path}"
            );
        }

        $absolutePath = $disk->path($paper->file_path);

        $stream = fopen($absolutePath, 'r');

        if ($stream === false) {
            throw new RuntimeException(
                'Could not open paper file.'
            );
        }

        try {
            return Http::baseUrl(
                rtrim(config('ai.url'), '/')
            )
                ->acceptJson()
                ->timeout(180)
                ->attach(
                    'paper',
                    $stream,
                    $paper->original_filename
                )
                ->post('/v1/papers/parse')
                ->throw()
                ->json();
        } finally {
            fclose($stream);
        }
    }

    public function embedTexts(array $texts): array
    {
        if ($texts === []) {
            return [];
        }

        return Http::baseUrl(
            rtrim(config('ai.url'), '/')
        )
            ->acceptJson()
            ->timeout(180)
            ->post('/v1/embeddings/batch', [
                'texts' => array_values($texts),
            ])
            ->throw()
            ->json();
    }

    public function analyzeSinglePaper(
        array $context,
    ): array {
        return Http::baseUrl(
            rtrim(config('ai.url'), '/')
        )
            ->acceptJson()
            ->timeout(300)
            ->post(
                '/v1/analysis/single-paper',
                $context
            )
            ->throw()
            ->json();
    }

    public function compareProjectPapers(
        array $context,
    ): array {
        return Http::baseUrl(
            rtrim(config('ai.url'), '/')
        )
            ->acceptJson()
            ->timeout(300)
            ->post(
                '/v1/comparison/project',
                $context
            )
            ->throw()
            ->json();
    }

    public function discoverResearchGaps(
        array $context,
    ): array {
        return Http::baseUrl(
            rtrim(config('ai.url'), '/')
        )
            ->acceptJson()
            ->timeout(300)
            ->post(
                '/v1/gaps/discover',
                $context
            )
            ->throw()
            ->json();
    }

    public function verifyGapNovelty(
        array $context,
    ): array {
        return Http::baseUrl(
            rtrim(config('ai.url'), '/')
        )
            ->acceptJson()
            ->timeout(300)
            ->post(
                '/v1/novelty/verify',
                $context
            )
            ->throw()
            ->json();
    }

    public function generateResearchIdea(
        array $context,
    ): array {
        return Http::baseUrl(
            rtrim(config('ai.url'), '/')
        )
            ->acceptJson()
            ->timeout(300)
            ->post(
                '/v1/ideas/generate',
                $context
            )
            ->throw()
            ->json();
    }
}
