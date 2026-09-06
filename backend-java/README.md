# Backend

API REST inicial do Dose Certa, desenvolvida com Java 25 e Spring Boot 4.1.1.

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

## Banco local

O backend usa H2 em modo arquivo durante o desenvolvimento. Os dados ficam em
`backend-java/data` e continuam disponíveis depois que a API é reiniciada.

O console pode ser acessado em `http://localhost:8080/h2-console` usando:

- URL JDBC: `jdbc:h2:file:./data/dose-certa`
- usuário: `sa`
- senha: vazia

Nos testes, um banco H2 separado é criado em memória e descartado ao final da
execução.

## Organização

- `controller`: endpoints HTTP.
- `dto`: dados de entrada e saída.
- `exception`: respostas de erro da API.
- `model`: entidades e enums do domínio.
- `repository`: armazenamento dos medicamentos.
- `service`: regras de negócio.

O frontend ainda não consome esta API. A integração HTTP será feita em uma etapa separada.
