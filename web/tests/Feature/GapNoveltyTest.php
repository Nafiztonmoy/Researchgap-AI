<?php

use App\Jobs\VerifyGapNoveltyJob;
use App\Models\GapNoveltyVerification;
use App\Models\User;
use App\Services\Ai\AiServiceClient;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;

function createProjectWithGap(User $user): array
{
    $project = $user->researchProjects()->create([
        'title' => 'Quantum Fault Tolerance Project',
        'research_domain' => 'Quantum Computing',
        'research_question' => 'What are the limits of surface code threshold scaling?',
        'status' => 'active',
    ]);

    $gap = $project->researchGaps()->create([
        'title' => 'Absence of Real-Time Scalable Decoders Under Correlated Phase Noise',
        'category' => 'methodological',
        'description' => 'Existing decoders assume uncorrelated Pauli noise, breaking down on physical transmon architectures.',
        'rationale' => 'Addressing this is critical for fault-tolerant syndrome processing at scale.',
        'evidence_sources' => [],
        'potential_impact' => 'high',
        'actionability_score' => 9,
        'suggested_directions' => ['Implement graph neural network syndrome decoding.'],
        'status' => 'discovered',
    ]);

    return [$project, $gap];
}

test('project owner can trigger novelty verification for a research gap', function () {
    Queue::fake();

    $user = User::factory()->create();
    [$project, $gap] = createProjectWithGap($user);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->post(route('gaps.novelty.verify', $gap));

    $response->assertRedirect(route('projects.show', $project));
    $response->assertSessionHas('success');

    Queue::assertPushed(VerifyGapNoveltyJob::class, fn ($job) => $job->gapId === $gap->id);

    $this->assertDatabaseHas('gap_novelty_verifications', [
        'research_gap_id' => $gap->id,
        'status' => 'processing',
    ]);
});

test('unauthorized user cannot trigger novelty verification for another user gap', function () {
    Queue::fake();

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    [, $gap] = createProjectWithGap($owner);

    $response = $this->actingAs($otherUser)
        ->post(route('gaps.novelty.verify', $gap));

    $response->assertForbidden();
    Queue::assertNothingPushed();
});

test('verify gap novelty job successfully processes external literature analysis', function () {
    $user = User::factory()->create();
    [, $gap] = createProjectWithGap($user);

    $mockAiResponse = [
        'gap_id' => $gap->id,
        'novelty_score' => 88,
        'novelty_verdict' => 'Highly Novel',
        'synthesis' => 'While neural decoders exist for uncorrelated noise, zero prior literature successfully deploys them in real-time under correlated phase drift.',
        'overlapping_papers' => [
            [
                'title' => 'Neural Syndrome Decoding for Surface Codes',
                'authors' => ['Chamberland et al.'],
                'year' => 2024,
                'venue' => 'PRX Quantum',
                'citation_count' => 42,
                'abstract' => 'We study neural decoding...',
                'url' => 'https://arxiv.org/abs/2301.00000',
                'relevance_explanation' => 'Investigates neural networks but assumes independent identically distributed noise.',
                'overlap_level' => 'moderate',
            ],
        ],
        'distinguishing_angles' => [
            'Incorporate temporal recurrent cells specifically for non-Markovian phase memory.',
        ],
        'potential_pitfalls' => [
            'Inference latency must strictly remain below 1 microsecond hardware cycle.',
        ],
    ];

    $this->mock(AiServiceClient::class, function (MockInterface $mock) use ($mockAiResponse) {
        $mock->shouldReceive('verifyGapNovelty')
            ->once()
            ->andReturn($mockAiResponse);
    });

    $job = new VerifyGapNoveltyJob($gap->id);
    $job->handle(app(AiServiceClient::class));

    $this->assertDatabaseHas('gap_novelty_verifications', [
        'research_gap_id' => $gap->id,
        'novelty_score' => 88,
        'novelty_verdict' => 'Highly Novel',
        'status' => 'completed',
    ]);

    $verification = GapNoveltyVerification::where('research_gap_id', $gap->id)->first();
    expect($verification->overlapping_papers)->toHaveCount(1)
        ->and($verification->distinguishing_angles)->toHaveCount(1)
        ->and($verification->verified_at)->not->toBeNull();
});

test('verify gap novelty job records failure if AI service throws exception', function () {
    $user = User::factory()->create();
    [, $gap] = createProjectWithGap($user);

    $this->mock(AiServiceClient::class, function (MockInterface $mock) {
        $mock->shouldReceive('verifyGapNovelty')
            ->once()
            ->andThrow(new RuntimeException('Scholarly search endpoint timed out.'));
    });

    $job = new VerifyGapNoveltyJob($gap->id);

    try {
        $job->handle(app(AiServiceClient::class));
    } catch (RuntimeException $e) {
        expect($e->getMessage())->toBe('Scholarly search endpoint timed out.');
    }

    $this->assertDatabaseHas('gap_novelty_verifications', [
        'research_gap_id' => $gap->id,
        'status' => 'failed',
        'error_message' => 'Scholarly search endpoint timed out.',
    ]);
});
