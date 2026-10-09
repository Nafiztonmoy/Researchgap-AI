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
        Schema::create('project_comparisons', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('research_project_id')
                ->constrained()
                ->cascadeOnDelete()
                ->unique();

            $table->text('literature_synthesis');
            $table->text('methodology_landscape')->nullable();
            $table->text('dataset_landscape')->nullable();
            $table->json('matrix_rows');
            $table->json('tensions_and_contradictions');
            $table->json('shared_limitations');
            $table->unsignedInteger('compared_paper_count');
            $table->json('compared_paper_ids');

            $table->timestamp('compared_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_comparisons');
    }
};
