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
        Schema::create('cemiterios', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('name')->unique();;
            $table->string('location');
            $table->string('address');
            $table->unsignedInteger('totalPlots');
            $table->unsignedInteger('occupiedPlots');
            $table->unsignedInteger('totalQuadras');
            $table->unsignedInteger('plotsPerQuadra');
            $table->string('cemeteryType');
            $table->unsignedInteger('yearEstablished');
            $table->unsignedInteger('areaSize');
            $table->boolean('hasOssuary');
            $table->boolean('hasColumbarium');
            $table->string('responsibleName');
            $table->string('responsiblePhone');
            $table->string('email');
            $table->string('openingHours');
            $table->string('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemiterios');
    }
};
