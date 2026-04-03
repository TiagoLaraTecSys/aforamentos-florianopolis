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
        $this->down();
        Schema::create('burials', function (Blueprint $table) {
            $table->id();

            // Relacionamento com cemitério
            $table->foreignId('cemetery_id')->nullable()->constrained('cemiterios')->nullOnDelete();

            // Identificação
            $table->string('galsc')->nullable();
            $table->string('burial_number')->nullable();

            // Dados do falecido
            $table->string('deceased_name');
            $table->date('date_of_birth')->nullable();
            $table->date('date_of_death')->nullable();
            $table->date('burial_date');

            // Localização
            $table->string('quadra')->nullable();
            $table->string('plot_number')->nullable();
            $table->string('sector')->nullable();

            // Tipo de sepultamento
            $table->enum('burial_type', [
                'INUMAÇÃO',
                'TUMULAÇÃO(GAVETA)',
                'EXUMAÇÃO',
                'TRANSLADAÇÃO',
                'CREMAÇÃO',
                'REINUMAÇÃO',
                'OSSÁRIO'
            ]);

            // Status atual
            $table->enum('current_status', [
                'Sepultado',
                'Exumado',
                'Transladado',
                'Cremado'
            ]);

            // Responsável
            $table->string('responsible_name')->nullable();
            $table->string('responsible_phone')->nullable();

            // Observações
            $table->text('notes')->nullable();

            // Regularização
            $table->integer('regularization_period_years')->default(5);
            $table->date('next_regularization_date')->nullable();
            $table->date('last_regularization_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('burials');
    }
};
