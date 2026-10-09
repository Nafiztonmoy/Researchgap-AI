<?php

use App\Models\ResearchProject;
use App\Models\User;

function makeProject(User $user, array $attributes = []): ResearchProject
{
    return $user->researchProjects()->create([
        'title' => $attributes['title'] ?? 'Bengali Fake News Detection',
        'research_domain' => $attributes['research_domain'] ?? 'Natural Language Processing',
        'research_question' => $attributes['research_question'] ?? 'How can misinformation detection be improved for Bengali social media?',
        'status' => 'active',
    ]);
}

test('an authenticated user can create a research project', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/projects', [
        'title' => 'Low-resource misinformation detection',
        'research_domain' => 'NLP',
        'keywords' => ['Bengali', 'misinformation'],
    ]);

    $project = ResearchProject::query()->first();

    expect($project)->not->toBeNull()
        ->and($project->user_id)->toBe($user->id);

    $response->assertRedirect(route('projects.show', $project));
});

test('a user cannot open another users project', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $project = makeProject($owner);

    $this->actingAs($otherUser)
        ->get(route('projects.show', $project))
        ->assertForbidden();
});

test('project index only includes the signed in users projects', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    makeProject($user, ['title' => 'My project']);
    makeProject($otherUser, ['title' => 'Not my project']);

    $response = $this->actingAs($user)->get(route('projects.index'));

    $response->assertOk();
    $response->assertSee('My project');
    $response->assertDontSee('Not my project');
});

test('project owner can access dedicated workspace sub-pages', function () {
    $user = User::factory()->create();
    $project = makeProject($user);

    $this->actingAs($user)
        ->get(route('projects.comparison.show', $project))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('projects.gaps.index', $project))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('projects.novelty.index', $project))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('projects.ideas.index', $project))
        ->assertOk();
});

test('unauthorized user cannot access dedicated workspace sub-pages', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $project = makeProject($owner);

    $this->actingAs($other)
        ->get(route('projects.comparison.show', $project))
        ->assertForbidden();

    $this->actingAs($other)
        ->get(route('projects.gaps.index', $project))
        ->assertForbidden();

    $this->actingAs($other)
        ->get(route('projects.novelty.index', $project))
        ->assertForbidden();

    $this->actingAs($other)
        ->get(route('projects.ideas.index', $project))
        ->assertForbidden();
});
