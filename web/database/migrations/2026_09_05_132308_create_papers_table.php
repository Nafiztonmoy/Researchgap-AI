<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('papers', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('research_project_id')
                ->constrained()
                ->cascadeOnDelete();

            // Academic metadata
            $table->string('title')->nullable();
            $table->json('authors')->nullable();
            $table->text('abstract')->nullable();
            $table->unsignedSmallInteger('publication_year')->nullable();
            $table->string('venue')->nullable();
            $table->string('doi')->nullable();
            $table->json('keywords')->nullable();

            // Uploaded file information
            $table->string('original_filename');
            $table->string('file_disk')->default('local');
            $table->string('file_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');

            // Processing information
            $table->unsignedInteger('page_count')->nullable();

            $table->string('processing_status')
                ->default('uploaded');

            $table->decimal(
                'extraction_confidence',
                5,
                4
            )->nullable();

            $table->text('processing_error')->nullable();

            $table->timestamps();

            $table->index([
                'research_project_id',
                'processing_status',
            ]);

            $table->index('doi');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('papers');
    }
};
