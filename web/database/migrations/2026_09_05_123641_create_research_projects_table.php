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
        Schema::create('research_projects', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('research_domain')->nullable();
            $table->text('research_question')->nullable();
            $table->text('description')->nullable();
            $table->string('target_population')->nullable();

            $table->json('keywords')->nullable();

            $table->text('preferred_methodology')->nullable();
            $table->text('notes')->nullable();

            $table->string('status')->default('active');

            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_projects');
    }
};
