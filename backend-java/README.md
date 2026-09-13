# Backend

API REST inicial do Dose Certa, desenvolvida com Java 25 e Spring Boot 4.1.1.

## Proteção da API — atualização de setembro de 2026

A API agora escuta somente em `127.0.0.1` por padrão. Configure
`DOSE_CERTA_API_TOKEN` com um segredo aleatório de pelo menos 32 caracteres e envie
`Authorization: Bearer <token>` em todas as operações de medicamentos. Não coloque
esse segredo em variáveis `VITE_*`, no APK, no Git ou em exemplos preenchidos.
Sem configuração, as operações retornam `503`; credencial ausente ou incorreta
retorna `401`. `GET /api/health` continua público, e preflights passam pela validação CORS.

As cotas de requisição são separadas para chamadas autenticadas, credenciais
rejeitadas e rotas públicas. Assim, uma rajada no health check ou com token inválido
não consome a capacidade reservada ao cliente autenticado. Excesso recebe `429` e
`Retry-After`. Esse limite simples não substitui um proxy com proteção contra abuso
e limites de corpo/conexões. As respostas recebem `no-store`, `nosniff` e proteção
contra enquadramento em páginas.

O console H2 está **desativado**.
`DOSE_CERTA_DB_PASSWORD` permite configurar a senha de um banco novo. Para um arquivo
existente, alterar a variável não muda a senha do banco: faça backup e uma migração
controlada da credencial. O padrão vazio foi mantido apenas por compatibilidade local.

Este é um serviço **individual**, não multiusuário: o token autoriza acesso a todos
os registros. Antes de expor na rede, implemente usuários/permissões por registro,
HTTPS, rotação de credenciais, paginação e limites de tamanho. Alterar
`DOSE_CERTA_BIND_ADDRESS` sozinho não torna a API adequada para produção.

O frontend permanece offline e não precisa desse token para funcionar.

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

O console web do H2 permanece desativado. Para inspecionar um banco de
desenvolvimento, pare a aplicação e use uma ferramenta local confiável com a URL
`jdbc:h2:file:./data/dose-certa` e a credencial configurada no ambiente.

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
