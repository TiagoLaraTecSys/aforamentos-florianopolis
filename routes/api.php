<?php
use App\Http\Controllers\Api\TestController;
use Illuminate\Http\Request;

Route::get('/test', [TestController::class, 'index']);
Route::post('/test', [TestController::class, 'store']);
