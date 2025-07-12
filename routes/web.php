<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SepultamentoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect('/dashboard')
        : redirect('/login');
});

Route::get('/dashboard', function () {
    return redirect()->route('sepultamentos.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Rotas para Sepultamentos
    Route::resource('sepultamentos', SepultamentoController::class);
    Route::get('sepultamentos/export/csv', [SepultamentoController::class, 'export'])->name('sepultamentos.export');
});

require __DIR__.'/auth.php';
