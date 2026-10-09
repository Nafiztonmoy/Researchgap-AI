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
        Schema::create('research_gaps', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('research_project_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('category');
            $table->text('description');
            $table->text('rationale');
            $table->json('evidence_sources');
            $table->string('potential_impact');
            $table->unsignedTinyInteger('actionability_score')->default(5);
            $table->json('suggested_directions');
            $table->string('status')->default('discovered');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_gaps');
    }
};
