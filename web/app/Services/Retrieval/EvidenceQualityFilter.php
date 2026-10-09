<?php

namespace App\Services\Retrieval;

class EvidenceQualityFilter
{
    private const MIN_SIMILARITY = 0.60;

    private const MIN_EXCERPT_CHARACTERS = 200;

    private const EXCLUDED_SECTIONS = [
        'Acknowledgements',
        'Acknowledgments',
    ];

    public function apply(
        array $evidence,
        int $limit = 10,
    ): array {
        $limit = max(1, min($limit, 50));

        $filtered = [];
        $seenChunks = [];
        $seenSignatures = [];

        $paperIds = array_values(
            array_unique(
                array_filter(
                    array_column($evidence, 'paper_id')
                )
            )
        );

        $multiplePapers = count($paperIds) > 1;

        $paperCounts = [];

        foreach ($evidence as $item) {
            $similarity = (float) (
                $item['similarity'] ?? 0
            );

            if ($similarity < self::MIN_SIMILARITY) {
                continue;
            }

            $excerpt = trim(
                (string) ($item['excerpt'] ?? '')
            );

            if (
                mb_strlen($excerpt)
                < self::MIN_EXCERPT_CHARACTERS
            ) {
                continue;
            }

            $section = trim(
                (string) ($item['section'] ?? '')
            );

            if (
                in_array(
                    $section,
                    self::EXCLUDED_SECTIONS,
                    true
                )
            ) {
                continue;
            }

            $chunkId = $item['chunk_id'] ?? null;

            if (
                $chunkId !== null
                && isset($seenChunks[$chunkId])
            ) {
                continue;
            }

            $signatureText = mb_strtolower(
                preg_replace(
                    '/\s+/u',
                    ' ',
                    mb_substr($excerpt, 0, 300)
                ) ?? ''
            );

            $signature = md5($signatureText);

            if (isset($seenSignatures[$signature])) {
                continue;
            }

            $paperId = (string) (
                $item['paper_id'] ?? ''
            );

            /*
             * When multiple papers exist, prevent one paper
             * from completely dominating project evidence.
             */
            if ($multiplePapers) {
                $paperCounts[$paperId] ??= 0;

                if ($paperCounts[$paperId] >= 5) {
                    continue;
                }
            }

            $filtered[] = $item;

            if ($chunkId !== null) {
                $seenChunks[$chunkId] = true;
            }

            $seenSignatures[$signature] = true;

            if ($multiplePapers) {
                $paperCounts[$paperId]++;
            }

            if (count($filtered) >= $limit) {
                break;
            }
        }

        return $filtered;
    }
}
