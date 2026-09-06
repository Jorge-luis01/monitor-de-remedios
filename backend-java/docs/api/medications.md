# API de medicamentos

URL local: `http://localhost:8080`

## Verificar a API

```http
GET /api/health
```

## Cadastrar

```http
POST /api/medications
Content-Type: application/json

{
  "name": "Dipirona",
  "dosage": "500 mg",
  "intervalHours": 8,
  "durationDays": 7,
  "firstDose": "08:00",
  "reminderType": "ALARM"
}
```

## Listar

```http
GET /api/medications
```

## Consultar pelo identificador

```http
GET /api/medications/{id}
```

## Pausar ou retomar

```http
PATCH /api/medications/{id}/status
Content-Type: application/json

{
  "status": "PAUSED"
}
```

Valores permitidos: `ACTIVE` e `PAUSED`.

## Editar dados do medicamento

```http
PUT /api/medications/{id}
Content-Type: application/json

{
  "name": "Dipirona",
  "dosage": "1 g",
  "intervalHours": 8,
  "durationDays": 5,
  "firstDose": "08:00",
  "reminderType": "NOTIFICATION"
}
```

## Excluir

```http
DELETE /api/medications/{id}
```
