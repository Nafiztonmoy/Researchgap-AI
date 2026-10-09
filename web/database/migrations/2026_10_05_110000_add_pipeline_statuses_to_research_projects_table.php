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
        Schema::table('research_projects', function (Blueprint $table) {
            $table->string('comparison_status')->default('idle')->after('status');
            $table->text('comparison_error')->nullable()->after('comparison_status');
            $table->string('gap_discovery_status')->default('idle')->after('comparison_error');
            $table->text('gap_discovery_error')->nullable()->after('gap_discovery_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            $table->dropColumn([
                'comparison_status',
                'comparison_error',
                'gap_discovery_status',
                'gap_discovery_error',
            ]);
        });
    }
};
