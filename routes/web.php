<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SepultamentoController;
use App\Http\Controllers\TestEmailController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
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

    Route::resource('users', UserController::class);
    Route::get('/users', [UserController::class, 'index'])->name('users');


    // Rotas para Teste de Email
    Route::get('test-email', [TestEmailController::class, 'testForm'])->name('test.email.form');
    Route::get('test-email/api', [TestEmailController::class, 'test'])->name('test.email');
    Route::post('test-email/send', [TestEmailController::class, 'sendTest'])->name('test.email.send');
});

require __DIR__.'/auth.php';
