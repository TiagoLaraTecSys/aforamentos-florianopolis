<?php
use App\Http\Controllers\Api\TestController;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\CemiterioController;


Route::get('/test', [TestController::class, 'index']);
Route::post('/test', [TestController::class, 'store']);

Route::middleware(['web', 'auth'])->group(function () {
    Route::apiResource('cemiterios', CemiterioController::class);
});
