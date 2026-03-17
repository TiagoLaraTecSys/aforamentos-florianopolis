<?php
use App\Http\Controllers\Api\TestController;


Route::get('/test', [TestController::class, 'index']);
Route::post('/test', [TestController::class, 'store']);
