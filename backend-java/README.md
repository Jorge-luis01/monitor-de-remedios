# Backend

API REST inicial do Dose Certa, desenvolvida com Java 21 e Spring Boot 4.1.1.

## Endpoints

- `GET /api/health`
- `POST /api/medications`
- `GET /api/medications`
- `GET /api/medications/{id}`
- `PATCH /api/medications/{id}/status`
- `DELETE /api/medications/{id}`

Exemplos de requisições estão em `docs/api/medications.md`.

## Desenvolvimento

```bash
mvn spring-boot:run
```

Para executar os testes:

```bash
mvn test
```

## Organização

- `controller`: endpoints HTTP.
- `dto`: dados de entrada e saída.
- `exception`: respostas de erro da API.
- `model`: entidades e enums do domínio.
- `repository`: armazenamento dos medicamentos.
- `service`: regras de negócio.

O repositório atual é mantido em memória. Um banco de dados será adicionado quando a integração com o frontend estiver pronta.
