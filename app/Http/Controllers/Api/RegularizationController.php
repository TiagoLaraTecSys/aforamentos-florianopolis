<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Burial;
use App\Models\Lease;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegularizationController extends Controller
{
    private const WINDOW_DAYS_AHEAD  = 90;
    private const WINDOW_DAYS_OVERDUE = 30;

    public function index(Request $request): JsonResponse
    {
        $cemeteryId = $request->filled('cemetery_id') ? (int) $request->cemetery_id : null;

        $notifications = $this->buildNotifications($cemeteryId);

        usort($notifications, function ($a, $b) {
            $order = ['high' => 0, 'medium' => 1, 'low' => 2];
            if ($order[$a['urgency']] !== $order[$b['urgency']]) {
                return $order[$a['urgency']] - $order[$b['urgency']];
            }
            return $a['days_until_next'] - $b['days_until_next'];
        });

        return response()->json(['data' => $notifications]);
    }

    public function count(Request $request): JsonResponse
    {
        $cemeteryId = $request->filled('cemetery_id') ? (int) $request->cemetery_id : null;

        return response()->json(['count' => count($this->buildNotifications($cemeteryId))]);
    }

    private function buildNotifications(?int $cemeteryId): array
    {
        $today  = Carbon::today();
        $result = [];

        // ── Burials ──────────────────────────────────────────────────────────
        $burialQuery = Burial::with('cemetery');
        if ($cemeteryId) {
            $burialQuery->where('cemetery_id', $cemeteryId);
        }

        foreach ($burialQuery->get() as $burial) {
            if (!$burial->burial_date) {
                continue;
            }

            $nextDate = $burial->next_regularization_date
                ? Carbon::parse($burial->next_regularization_date)
                : $this->nextCycle(Carbon::parse($burial->burial_date), $burial->regularization_period_years ?? 5, $today);

            $daysUntil = (int) $today->diffInDays($nextDate, false);

            if ($daysUntil > self::WINDOW_DAYS_AHEAD || $daysUntil < -self::WINDOW_DAYS_OVERDUE) {
                continue;
            }

            $result[] = [
                'id'                       => 'burial-' . $burial->id,
                'type'                     => 'burial',
                'item_id'                  => $burial->id,
                'title'                    => 'Regularização de Sepultamento - ' . $burial->deceased_name,
                'description'              => $daysUntil < 0
                    ? 'Atrasado há ' . abs($daysUntil) . ' dias'
                    : 'Regularizar em ' . $daysUntil . ' dias',
                'urgency'                  => $this->urgency($daysUntil),
                'days_until_next'          => $daysUntil,
                'next_regularization_date' => $nextDate->toDateString(),
                'years_elapsed'            => (int) Carbon::parse($burial->burial_date)->diffInYears($today),
                'cemetery_name'            => $burial->cemetery?->name ?? 'Desconhecido',
                'location'                 => "Quadra {$burial->quadra} - Sepultura {$burial->plot_number}",
                'responsible_name'         => $burial->responsible_name,
                'responsible_phone'        => $burial->responsible_phone,
                'item'                     => $burial,
            ];
        }

        // ── Leases ───────────────────────────────────────────────────────────
        $leaseQuery = Lease::with('cemetery');
        if ($cemeteryId) {
            $leaseQuery->where('cemetery_id', $cemeteryId);
        }

        foreach ($leaseQuery->get() as $lease) {
            if ($lease->lease_type === 'Temporário') {
                if (!$lease->expiry_date) {
                    continue;
                }

                $nextDate  = Carbon::parse($lease->expiry_date);
                $daysUntil = (int) $today->diffInDays($nextDate, false);

                if ($daysUntil > self::WINDOW_DAYS_AHEAD) {
                    continue;
                }

                $result[] = [
                    'id'                       => 'lease-' . $lease->id,
                    'type'                     => 'lease',
                    'item_id'                  => $lease->id,
                    'title'                    => 'Renovação de Aforamento - ' . $lease->leaseholder_name,
                    'description'              => $daysUntil < 0
                        ? 'Vencido há ' . abs($daysUntil) . ' dias'
                        : 'Vence em ' . $daysUntil . ' dias',
                    'urgency'                  => $this->urgency($daysUntil),
                    'days_until_next'          => $daysUntil,
                    'next_regularization_date' => $nextDate->toDateString(),
                    'years_elapsed'            => (int) Carbon::parse($lease->start_date)->diffInYears($today),
                    'cemetery_name'            => $lease->cemetery?->name ?? 'Desconhecido',
                    'location'                 => "Quadra {$lease->quadra} - Jazigo {$lease->plot_number}",
                    'responsible_name'         => $lease->responsible_name,
                    'responsible_phone'        => $lease->responsible_phone,
                    'item'                     => $lease,
                ];
            } else {
                // Perpétuo
                if (!$lease->start_date) {
                    continue;
                }

                $nextDate = $lease->next_regularization_date
                    ? Carbon::parse($lease->next_regularization_date)
                    : $this->nextCycle(Carbon::parse($lease->start_date), $lease->regularization_period_years ?? 5, $today);

                $daysUntil = (int) $today->diffInDays($nextDate, false);

                if ($daysUntil > self::WINDOW_DAYS_AHEAD || $daysUntil < -self::WINDOW_DAYS_OVERDUE) {
                    continue;
                }

                $result[] = [
                    'id'                       => 'lease-perp-' . $lease->id,
                    'type'                     => 'lease',
                    'item_id'                  => $lease->id,
                    'title'                    => 'Regularização de Aforamento Perpétuo - ' . $lease->leaseholder_name,
                    'description'              => $daysUntil < 0
                        ? 'Atrasado há ' . abs($daysUntil) . ' dias'
                        : 'Regularizar em ' . $daysUntil . ' dias',
                    'urgency'                  => $this->urgency($daysUntil),
                    'days_until_next'          => $daysUntil,
                    'next_regularization_date' => $nextDate->toDateString(),
                    'years_elapsed'            => (int) Carbon::parse($lease->start_date)->diffInYears($today),
                    'cemetery_name'            => $lease->cemetery?->name ?? 'Desconhecido',
                    'location'                 => "Quadra {$lease->quadra} - Jazigo {$lease->plot_number}",
                    'responsible_name'         => $lease->responsible_name,
                    'responsible_phone'        => $lease->responsible_phone,
                    'item'                     => $lease,
                ];
            }
        }

        return $result;
    }

    private function nextCycle(Carbon $start, int $periodYears, Carbon $today): Carbon
    {
        $elapsed  = (int) $start->diffInYears($today);
        $nextYears = (int) ceil($elapsed / $periodYears) * $periodYears;
        if ($nextYears === 0) {
            $nextYears = $periodYears;
        }
        return $start->copy()->addYears($nextYears);
    }

    private function urgency(int $daysUntil): string
    {
        if ($daysUntil <= 30) return 'high';
        if ($daysUntil <= 60) return 'medium';
        return 'low';
    }
}
