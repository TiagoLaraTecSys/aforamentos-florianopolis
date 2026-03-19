<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SepultamentoController;
use App\Http\Controllers\TestEmailController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

Route::post('/login', function (Request $request) {

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Credenciais inválidas'], 401);
    }

    $request->session()->regenerate();

    return response()->json([
        'user' => Auth::user()
    ]);
});

Route::middleware('auth')->get('/me', function (Request $request) {
    return response()->json($request->user());
});

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    return response()->json(['message' => 'Logout']);
});

Route::get('{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
