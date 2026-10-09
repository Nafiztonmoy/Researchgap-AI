<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE paper_chunks ADD COLUMN embedding vector NULL'
            );
        } else {
            Schema::table('paper_chunks', function (Blueprint $table) {
                $table->text('embedding')->nullable();
            });
        }

        Schema::table('paper_chunks', function (Blueprint $table) {
            $table->string('embedding_model')->nullable();
            $table->unsignedInteger('embedding_dimensions')->nullable();
            $table->timestamp('embedded_at')->nullable();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE paper_chunks DROP COLUMN IF EXISTS embedding'
            );
        } else {
            Schema::table('paper_chunks', function (Blueprint $table) {
                $table->dropColumn('embedding');
            });
        }

        Schema::table('paper_chunks', function (Blueprint $table) {
            $table->dropColumn([
                'embedding_model',
                'embedding_dimensions',
                'embedded_at',
            ]);
        });
    }
};
