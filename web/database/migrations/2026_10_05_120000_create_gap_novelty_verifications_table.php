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
        Schema::create('gap_novelty_verifications', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('research_gap_id')
                ->constrained('research_gaps')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('novelty_score')->default(0);
            $table->string('novelty_verdict')->default('Moderately Novel');
            $table->text('synthesis')->nullable();
            $table->json('overlapping_papers')->nullable();
            $table->json('distinguishing_angles')->nullable();
            $table->json('potential_pitfalls')->nullable();
            $table->string('status')->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('verified_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gap_novelty_verifications');
    }
};
