<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('research_ideas', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('research_project_id')
                ->constrained('research_projects')
                ->cascadeOnDelete();

            $table->foreignUlid('research_gap_id')
                ->nullable()
                ->constrained('research_gaps')
                ->nullOnDelete();

            $table->string('title');
            $table->text('executive_summary')->nullable();
            $table->text('primary_hypothesis')->nullable();
            $table->json('hypothesized_mechanisms')->nullable();
            $table->text('system_architecture_overview')->nullable();
            $table->json('methodology_phases')->nullable();
            $table->json('target_datasets')->nullable();
            $table->json('baseline_models')->nullable();
            $table->json('evaluation_metrics')->nullable();
            $table->json('expected_scientific_contributions')->nullable();
            $table->json('risks_and_mitigations')->nullable();
            $table->json('publication_target_venues')->nullable();
            $table->string('status')->default('pending');
            $table->text('error_message')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_ideas');
    }
};
