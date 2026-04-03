<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\BurialController;
use App\Http\Controllers\Api\CemiterioController;
use App\Http\Controllers\Api\LeaseController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PendingOperationController;
use App\Http\Controllers\Api\RegularizationController;
use App\Http\Controllers\Api\TestController;
use Illuminate\Support\Facades\Route;

Route::get('/test', [TestController::class, 'index']);
Route::post('/test', [TestController::class, 'store']);

Route::middleware(['web', 'auth'])->group(function () {
    // Cemitérios
    Route::apiResource('cemiterios', CemiterioController::class);

    // Sepultamentos
    Route::apiResource('burials', BurialController::class);

    // Aforamentos
    Route::apiResource('leases', LeaseController::class);

    // Operações pendentes (apenas admin/moderador aprovam/rejeitam)
    Route::get('pending-operations', [PendingOperationController::class, 'index']);
    Route::post('pending-operations/{pendingOperation}/approve', [PendingOperationController::class, 'approve']);
    Route::post('pending-operations/{pendingOperation}/reject', [PendingOperationController::class, 'reject']);

    // Notificações do usuário autenticado
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Regularizações pendentes (notificações calculadas no backend)
    Route::get('regularizations', [RegularizationController::class, 'index']);
    Route::get('regularizations/count', [RegularizationController::class, 'count']);

    // Logs de auditoria (apenas admin/moderador)
    Route::get('audit-logs', [AuditLogController::class, 'index']);
});
