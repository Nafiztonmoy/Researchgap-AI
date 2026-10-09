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
        Schema::create('paper_analyses', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('paper_id')
                ->constrained()
                ->cascadeOnDelete()
                ->unique();

            $table->json('research_problem');
            $table->json('objectives');
            $table->json('methodology');
            $table->json('datasets_or_data_sources');
            $table->json('key_findings');
            $table->json('contributions');
            $table->json('author_stated_limitations');
            $table->json('ai_inferred_limitations');
            $table->json('future_work');
            $table->text('analysis_scope_note')->nullable();

            $table->timestamp('analyzed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paper_analyses');
    }
};
