<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_operations', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type');          // burial, lease, cemiterio
            $table->unsignedBigInteger('entity_id')->nullable(); // null for create ops
            $table->string('operation_type');        // create, update, delete
            $table->json('payload');                 // data to apply on approval
            $table->enum('status', ['pendente', 'aprovado', 'rejeitado'])->default('pendente');

            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_operations');
    }
};
