<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cemetery_id')->nullable()->constrained('cemiterios')->nullOnDelete();

            $table->string('leaseholder_name');
            $table->string('quadra')->nullable();
            $table->string('plot_number')->nullable();
            $table->string('sector')->nullable();

            $table->enum('lease_type', ['Perpétuo', 'Temporário']);
            $table->date('start_date');
            $table->date('expiry_date')->nullable();

            $table->enum('status', ['Ativo', 'Vencido', 'Renovado'])->default('Ativo');
            $table->decimal('amount', 10, 2)->default(0);

            $table->string('responsible_name')->nullable();
            $table->string('responsible_phone')->nullable();
            $table->text('notes')->nullable();

            $table->integer('regularization_period_years')->default(5);
            $table->date('next_regularization_date')->nullable();
            $table->date('last_regularization_date')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};
