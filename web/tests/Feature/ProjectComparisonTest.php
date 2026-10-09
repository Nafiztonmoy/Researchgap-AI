<?php

use App\Enums\PaperStatus;
use App\Jobs\CompareProjectJob;
use App\Models\ResearchProject;
use App\Models\User;
use App\Services\Ai\AiServiceClient;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;

function createProjectWithAnalyses(User $user, int $paperCount = 2): ResearchProject
{
    $project = $user->researchProjects()->create([
        'title' => 'Cross-Paper Evaluation Project',
        'research_domain' => 'Computer Science',
        'research_question' => 'How do distributed consensus algorithms scale?',
        'status' => 'active',
    ]);

    for ($i = 1; $i <= $paperCount; $i++) {
        $paper = $project->papers()->create([
            'title' => "Paper {$i}: Distributed Consensus",
            'original_filename' => "paper_{$i}.pdf",
            'file_disk' => 'local',
            'file_path' => "papers/test/paper_{$i}.pdf",
            'mime_type' => 'application/pdf',
            'file_size' => 2048,
            'processing_status' => PaperStatus::COMPLETED,
        ]);

        $paper->analysis()->create([
            'research_problem' => ['claim' => "Consensus latency in cluster {$i}"],
            'objectives' => [['claim' => "Analyze scale in cluster {$i}"]],
            'methodology' => [['claim' => "Raft protocol iteration {$i}"]],
            'datasets_or_data_sources' => [['claim' => "Simulation network {$i}"]],
            'key_findings' => [['claim' => "Throughput reaches {$i}000 ops/sec"]],
            'contributions' => [['claim' => "Optimized leader failover {$i}"]],
            'author_stated_limitations' => [['limitation' => "High latency at {$i}00 nodes"]],
            'ai_inferred_limitations' => [['limitation' => "Network partition vulnerability {$i}"]],
            'future_work' => [['proposal' => 'Test on 1000 nodes']],
        ]);
    }

    return $project;
}

test('project owner can trigger comparison when two or more analyzed papers exist', function () {
    Queue::fake();

    $user = User::factory()->create();
    $project = createProjectWithAnalyses($user, 2);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->post(route('projects.comparison.generate', $project));

    $response->assertRedirect(route('projects.show', $project));
    Queue::assertPushed(CompareProjectJob::class, fn ($job) => $job->projectId === $project->id);
});

test('triggering comparison fails when fewer than two papers have completed analysis', function () {
    Queue::fake();

    $user = User::factory()->create();
    $project = createProjectWithAnalyses($user, 1);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->post(route('projects.comparison.generate', $project));

    $response->assertRedirect(route('projects.show', $project));
    $response->assertSessionHas('error');
    Queue::assertNotPushed(CompareProjectJob::class);
});

test('another user cannot trigger comparison generation for a project they do not own', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $project = createProjectWithAnalyses($owner, 2);

    $this->actingAs($otherUser)
        ->post(route('projects.comparison.generate', $project))
        ->assertForbidden();
});

test('compare project job calls ai service and creates project comparison record', function () {
    $user = User::factory()->create();
    $project = createProjectWithAnalyses($user, 2);

    $mockComparisonResult = [
        'literature_synthesis' => 'Across both papers, consensus throughput scales linearly up to 50 nodes before experiencing quadratic latency degradation.',
        'methodology_landscape' => 'Both investigations employ discrete-event simulations modeled after the Raft consensus algorithm.',
        'dataset_landscape' => 'Synthetic WAN traces with simulated packet drops.',
        'matrix_rows' => [
            [
                'dimension' => 'Primary Protocol',
                'values' => [
                    $project->papers[0]->id => 'Raft iteration 1',
                    $project->papers[1]->id => 'Raft iteration 2',
                ],
            ],
            [
                'dimension' => 'Reported Throughput',
                'values' => [
                    $project->papers[0]->id => '1000 ops/sec',
                    $project->papers[1]->id => '2000 ops/sec',
                ],
            ],
        ],
        'tensions_and_contradictions' => [
            [
                'topic' => 'Leader Election Latency',
                'paper_a_id' => $project->papers[0]->id,
                'paper_a_title' => $project->papers[0]->title,
                'paper_a_claim' => 'Heartbeat timer of 150ms is optimal.',
                'paper_b_id' => $project->papers[1]->id,
                'paper_b_title' => $project->papers[1]->title,
                'paper_b_claim' => 'Heartbeat timer of 50ms yields superior failover.',
                'analysis' => 'Paper B assumes high-bandwidth interconnects, whereas Paper A models lossy WAN networks.',
            ],
        ],
        'shared_limitations' => [
            [
                'theme' => 'Byzantine Fault Tolerance Absence',
                'description' => 'Neither implementation accommodates malicious or compromised nodes.',
                'affected_paper_ids' => [$project->papers[0]->id, $project->papers[1]->id],
                'gap_potential' => 'High',
            ],
        ],
    ];

    $mockAiClient = $this->mock(AiServiceClient::class, function (MockInterface $mock) use ($mockComparisonResult) {
        $mock->shouldReceive('compareProjectPapers')
            ->once()
            ->andReturn($mockComparisonResult);
    });

    $job = new CompareProjectJob($project->id);
    $job->handle($mockAiClient);

    $this->assertDatabaseHas('project_comparisons', [
        'research_project_id' => $project->id,
        'compared_paper_count' => 2,
    ]);

    $comparison = $project->fresh()->comparison;
    expect($comparison)->not->toBeNull();
    expect($comparison->literature_synthesis)->toContain('linear');
    expect($comparison->matrix_rows)->toHaveCount(2);
    expect($comparison->tensions_and_contradictions)->toHaveCount(1);
    expect($comparison->shared_limitations)->toHaveCount(1);
    expect($comparison->compared_paper_ids)->toHaveCount(2);
});

test('project show page returns project comparison data', function () {
    $user = User::factory()->create();
    $project = createProjectWithAnalyses($user, 2);

    $project->comparison()->create([
        'literature_synthesis' => 'Synthesized literature findings.',
        'methodology_landscape' => 'Methodologies surveyed.',
        'dataset_landscape' => 'Datasets surveyed.',
        'matrix_rows' => [
            [
                'dimension' => 'Domain',
                'values' => [
                    $project->papers[0]->id => 'CS',
                    $project->papers[1]->id => 'Networks',
                ],
            ],
        ],
        'tensions_and_contradictions' => [],
        'shared_limitations' => [],
        'compared_paper_count' => 2,
        'compared_paper_ids' => [$project->papers[0]->id, $project->papers[1]->id],
        'compared_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('projects.show', $project));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('projects/show')
        ->has('project.comparison')
        ->where('project.comparison.literature_synthesis', 'Synthesized literature findings.')
    );
});
