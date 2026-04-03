<?php

namespace Tests\Feature;

use App\Models\Burial;
use App\Models\Cemiterio;
use App\Models\Lease;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegularizationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/regularizations')->assertUnauthorized();
    }

    public function test_count_requires_authentication(): void
    {
        $this->getJson('/api/regularizations/count')->assertUnauthorized();
    }

    // ── Empty state ───────────────────────────────────────────────────────────

    public function test_returns_empty_when_no_burials_or_leases(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    // ── Burial: stored next_regularization_date ───────────────────────────────

    public function test_burial_with_next_date_within_window_appears(): void
    {
        Burial::factory()->withNextRegularizationIn(10)->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'burial')
            ->assertJsonPath('data.0.days_until_next', 10);
    }

    public function test_burial_with_next_date_beyond_90_days_does_not_appear(): void
    {
        Burial::factory()->withNextRegularizationIn(91)->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_overdue_burial_within_30_days_appears(): void
    {
        Burial::factory()->overdue(15)->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.urgency', 'high');
    }

    public function test_burial_overdue_more_than_30_days_does_not_appear(): void
    {
        Burial::factory()->overdue(31)->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    // ── Burial: 5-year cycle fallback ─────────────────────────────────────────

    public function test_burial_at_5_year_mark_appears_when_no_next_date_stored(): void
    {
        // Buried exactly 5 years ago → next cycle = today → daysUntil = 0
        Burial::factory()->create([
            'burial_date'              => now()->subYears(5)->toDateString(),
            'next_regularization_date' => null,
        ]);

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.urgency', 'high');
    }

    public function test_burial_far_from_5_year_cycle_does_not_appear(): void
    {
        // Buried 2 years ago → next cycle = 5 years from burial = 3 years away
        Burial::factory()->create([
            'burial_date'              => now()->subYears(2)->toDateString(),
            'next_regularization_date' => null,
        ]);

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_stored_next_date_overrides_cycle_calculation(): void
    {
        // Burial 2 years ago (cycle would be 3 years away = outside window)
        // but next_regularization_date = 20 days away (inside window)
        Burial::factory()->create([
            'burial_date'              => now()->subYears(2)->toDateString(),
            'next_regularization_date' => now()->addDays(20)->toDateString(),
        ]);

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.days_until_next', 20);
    }

    // ── Urgency levels ────────────────────────────────────────────────────────

    public function test_urgency_high_when_30_days_or_less(): void
    {
        Burial::factory()->withNextRegularizationIn(30)->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonPath('data.0.urgency', 'high');
    }

    public function test_urgency_medium_when_31_to_60_days(): void
    {
        Burial::factory()->withNextRegularizationIn(45)->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonPath('data.0.urgency', 'medium');
    }

    public function test_urgency_low_when_61_to_90_days(): void
    {
        Burial::factory()->withNextRegularizationIn(75)->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonPath('data.0.urgency', 'low');
    }

    // ── Cemetery filter ───────────────────────────────────────────────────────

    public function test_cemetery_filter_returns_only_matching_burials(): void
    {
        $cemetery1 = Cemiterio::factory()->create();
        $cemetery2 = Cemiterio::factory()->create();

        Burial::factory()->withNextRegularizationIn(5)->create(['cemetery_id' => $cemetery1->id]);
        Burial::factory()->withNextRegularizationIn(5)->create(['cemetery_id' => $cemetery2->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/regularizations?cemetery_id={$cemetery1->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->assertEquals('burial-' . Burial::first()->id, $response->json('data.0.id'));
    }

    // ── Leases ────────────────────────────────────────────────────────────────

    public function test_temporary_lease_expiring_soon_appears(): void
    {
        Lease::factory()->temporario(now()->addDays(20)->toDateString())->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'lease')
            ->assertJsonPath('data.0.urgency', 'high');
    }

    public function test_temporary_lease_not_expiring_soon_does_not_appear(): void
    {
        Lease::factory()->temporario(now()->addDays(120)->toDateString())->create();

        $this->actingAs($this->user)
            ->getJson('/api/regularizations')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    // ── Count endpoint ────────────────────────────────────────────────────────

    public function test_count_endpoint_returns_correct_number(): void
    {
        Burial::factory()->withNextRegularizationIn(10)->create();
        Burial::factory()->withNextRegularizationIn(50)->create();
        Burial::factory()->withNextRegularizationIn(200)->create(); // outside window

        $this->actingAs($this->user)
            ->getJson('/api/regularizations/count')
            ->assertOk()
            ->assertJsonPath('count', 2);
    }

    public function test_count_respects_cemetery_filter(): void
    {
        $cemetery = Cemiterio::factory()->create();

        Burial::factory()->withNextRegularizationIn(10)->create(['cemetery_id' => $cemetery->id]);
        Burial::factory()->withNextRegularizationIn(10)->create(); // different cemetery

        $this->actingAs($this->user)
            ->getJson("/api/regularizations/count?cemetery_id={$cemetery->id}")
            ->assertOk()
            ->assertJsonPath('count', 1);
    }
}
