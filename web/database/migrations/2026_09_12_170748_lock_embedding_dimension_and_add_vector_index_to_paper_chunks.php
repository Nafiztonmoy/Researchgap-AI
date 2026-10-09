<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE paper_chunks
                 ALTER COLUMN embedding
                 TYPE vector(384)
                 USING embedding::vector(384)'
            );

            DB::statement(
                'CREATE INDEX paper_chunks_embedding_hnsw_idx
                 ON paper_chunks
                 USING hnsw (embedding vector_cosine_ops)
                 WHERE embedding IS NOT NULL'
            );
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'DROP INDEX IF EXISTS paper_chunks_embedding_hnsw_idx'
            );

            DB::statement(
                'ALTER TABLE paper_chunks
                 ALTER COLUMN embedding
                 TYPE vector
                 USING embedding::vector'
            );
        }
    }
};
