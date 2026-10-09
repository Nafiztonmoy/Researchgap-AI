<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paper_chunks', function (Blueprint $table) {
            $table->id();

            $table->foreignUlid('paper_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedInteger('chunk_index');

            $table->unsignedInteger('page_start');
            $table->unsignedInteger('page_end');

            $table->string('section_title')->nullable();

            $table->longText('text');

            $table->unsignedInteger('character_count')->default(0);

            $table->timestamps();

            $table->unique([
                'paper_id',
                'chunk_index',
            ]);

            $table->index([
                'paper_id',
                'page_start',
                'page_end',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_chunks');
    }
};
