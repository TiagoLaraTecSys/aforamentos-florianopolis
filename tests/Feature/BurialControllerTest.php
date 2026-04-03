<?php

namespace Tests\Feature;

use App\Models\Burial;
use App\Models\Cemiterio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BurialControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regular;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'moderador', 'operador', 'visitante', 'suporte'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        $this->admin   = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->regular = User::factory()->create();
        $this->regular->assignRole('operador');
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'deceased_name' => 'João da Silva',
            'burial_date'   => '2024-01-15',
            'burial_type'   => 'INUMAÇÃO',
            'current_status' => 'Sepultado',
        ], $overrides);
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    public function test_index_requires_authentication(): void
    {
        $this->getJson('/api/burials')->assertUnauthorized();
    }

    public function test_store_requires_authentication(): void
    {
        $this->postJson('/api/burials', $this->validPayload())->assertUnauthorized();
    }

    // ── Index ─────────────────────────────────────────────────────────────────

    public function test_index_returns_paginated_burials(): void
    {
        Burial::factory()->count(3)->create();

        $this->actingAs($this->admin)
            ->getJson('/api/burials')
            ->assertOk()
            ->assertJsonStructure(['data', 'total', 'per_page', 'current_page']);
    }

    public function test_index_filters_by_cemetery_id(): void
    {
        $cemetery = Cemiterio::factory()->create();
        Burial::factory()->create(['cemetery_id' => $cemetery->id]);
        Burial::factory()->create(); // different cemetery

        $response = $this->actingAs($this->admin)
            ->getJson("/api/burials?cemetery_id={$cemetery->id}")
            ->assertOk();

        $this->assertEquals(1, $response->json('total'));
    }

    public function test_index_filters_by_deceased_name(): void
    {
        Burial::factory()->create(['deceased_name' => 'Maria Joana']);
        Burial::factory()->create(['deceased_name' => 'Pedro Alves']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/burials?deceased_name=Maria')
            ->assertOk();

        $this->assertEquals(1, $response->json('total'));
        $this->assertStringContainsString('Maria', $response->json('data.0.deceased_name'));
    }

    // ── Store: admin creates directly ────────────────────────────────────────

    public function test_admin_can_create_burial_directly(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/burials', $this->validPayload())
            ->assertCreated()
            ->assertJsonPath('deceased_name', 'João da Silva')
            ->assertJsonPath('burial_type', 'INUMAÇÃO');
    }

    public function test_created_burial_persists_in_database(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/burials', $this->validPayload(['deceased_name' => 'Ana Costa']));

        $this->assertDatabaseHas('burials', ['deceased_name' => 'Ana Costa']);
    }

    // ── Store: validation ────────────────────────────────────────────────────

    public function test_store_returns_422_when_deceased_name_missing(): void
    {
        $payload = $this->validPayload();
        unset($payload['deceased_name']);

        $this->actingAs($this->admin)
            ->postJson('/api/burials', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['deceased_name']);
    }

    public function test_store_returns_422_when_burial_date_missing(): void
    {
        $payload = $this->validPayload();
        unset($payload['burial_date']);

        $this->actingAs($this->admin)
            ->postJson('/api/burials', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['burial_date']);
    }

    public function test_store_returns_422_when_burial_type_invalid(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/burials', $this->validPayload(['burial_type' => 'INVALIDO']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['burial_type']);
    }

    public function test_store_returns_422_when_cemetery_id_does_not_exist(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/burials', $this->validPayload(['cemetery_id' => 9999]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cemetery_id']);
    }

    // ── Store: approval workflow ──────────────────────────────────────────────

    public function test_operador_create_goes_to_pending(): void
    {
        $this->actingAs($this->regular)
            ->postJson('/api/burials', $this->validPayload())
            ->assertStatus(202)
            ->assertJsonPath('status', 'pendente');
    }

    public function test_operador_create_does_not_persist_burial(): void
    {
        $this->actingAs($this->regular)
            ->postJson('/api/burials', $this->validPayload(['deceased_name' => 'Pendente Silva']));

        $this->assertDatabaseMissing('burials', ['deceased_name' => 'Pendente Silva']);
    }

    public function test_operador_create_creates_pending_operation(): void
    {
        $this->actingAs($this->regular)
            ->postJson('/api/burials', $this->validPayload());

        $this->assertDatabaseHas('pending_operations', [
            'entity_type'    => 'burial',
            'operation_type' => 'create',
            'status'         => 'pendente',
            'requested_by'   => $this->regular->id,
        ]);
    }

    // ── Show ─────────────────────────────────────────────────────────────────

    public function test_show_returns_burial(): void
    {
        $burial = Burial::factory()->create(['deceased_name' => 'Fernanda Lima']);

        $this->actingAs($this->admin)
            ->getJson("/api/burials/{$burial->id}")
            ->assertOk()
            ->assertJsonPath('deceased_name', 'Fernanda Lima');
    }

    public function test_show_returns_404_for_nonexistent_burial(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/burials/9999')
            ->assertNotFound();
    }

    // ── Date serialization ───────────────────────────────────────────────────

    public function test_burial_date_serialized_as_yyyy_mm_dd(): void
    {
        $burial = Burial::factory()->create(['burial_date' => '2024-03-15']);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/burials/{$burial->id}")
            ->assertOk();

        $this->assertEquals('2024-03-15', $response->json('burial_date'));
    }

    public function test_next_regularization_date_serialized_as_yyyy_mm_dd(): void
    {
        $burial = Burial::factory()
            ->withNextRegularizationIn(30)
            ->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/burials/{$burial->id}")
            ->assertOk();

        $this->assertMatchesRegularExpression(
            '/^\d{4}-\d{2}-\d{2}$/',
            $response->json('next_regularization_date')
        );
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function test_admin_can_update_burial(): void
    {
        $burial = Burial::factory()->create(['deceased_name' => 'Nome Antigo']);

        $this->actingAs($this->admin)
            ->putJson("/api/burials/{$burial->id}", $this->validPayload(['deceased_name' => 'Nome Novo']))
            ->assertOk()
            ->assertJsonPath('deceased_name', 'Nome Novo');

        $this->assertDatabaseHas('burials', ['id' => $burial->id, 'deceased_name' => 'Nome Novo']);
    }

    public function test_operador_update_goes_to_pending(): void
    {
        $burial = Burial::factory()->create();

        $this->actingAs($this->regular)
            ->putJson("/api/burials/{$burial->id}", $this->validPayload())
            ->assertStatus(202)
            ->assertJsonPath('status', 'pendente');
    }

    public function test_update_returns_422_when_required_fields_missing(): void
    {
        $burial = Burial::factory()->create();

        $this->actingAs($this->admin)
            ->putJson("/api/burials/{$burial->id}", ['notes' => 'apenas notas'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['deceased_name', 'burial_date', 'burial_type', 'current_status']);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public function test_admin_can_delete_burial(): void
    {
        $burial = Burial::factory()->create();

        $this->actingAs($this->admin)
            ->deleteJson("/api/burials/{$burial->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Sepultamento excluído com sucesso.');

        $this->assertSoftDeleted('burials', ['id' => $burial->id]);
    }

    public function test_operador_delete_goes_to_pending(): void
    {
        $burial = Burial::factory()->create();

        $this->actingAs($this->regular)
            ->deleteJson("/api/burials/{$burial->id}")
            ->assertStatus(202)
            ->assertJsonPath('status', 'pendente');

        $this->assertDatabaseHas('burials', ['id' => $burial->id, 'deleted_at' => null]);
    }
}
