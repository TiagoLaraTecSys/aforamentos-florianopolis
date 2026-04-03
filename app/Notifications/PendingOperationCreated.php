<?php

namespace App\Notifications;

use App\Models\PendingOperation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PendingOperationCreated extends Notification
{
    use Queueable;

    public function __construct(
        public readonly PendingOperation $operation,
        public readonly User $requester
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $entityLabels = [
            'burial'    => 'Sepultamento',
            'lease'     => 'Aforamento',
            'cemiterio' => 'Cemitério',
        ];

        $operationLabels = [
            'create' => 'criação',
            'update' => 'atualização',
            'delete' => 'exclusão',
        ];

        $entityLabel    = $entityLabels[$this->operation->entity_type] ?? $this->operation->entity_type;
        $operationLabel = $operationLabels[$this->operation->operation_type] ?? $this->operation->operation_type;

        return [
            'pending_operation_id' => $this->operation->id,
            'entity_type'          => $this->operation->entity_type,
            'entity_id'            => $this->operation->entity_id,
            'operation_type'       => $this->operation->operation_type,
            'requested_by_id'      => $this->requester->id,
            'requested_by_name'    => $this->requester->name,
            'title'                => "Operação pendente: {$operationLabel} de {$entityLabel}",
            'message'              => "{$this->requester->name} solicitou {$operationLabel} de {$entityLabel} aguardando aprovação.",
        ];
    }
}
