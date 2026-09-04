# Dose Certa

Projeto de estudo para organizar horários de medicamentos e acompanhar doses ao longo de um tratamento.

O repositório reúne uma interface React e uma API Spring Boot. As duas aplicações ainda usam armazenamento próprio e serão integradas em uma próxima etapa.

## Estrutura

- `frontend-react`: interface em React, TypeScript e Vite.
- `backend-java`: API REST em Java e Spring Boot.

## Executando o frontend

```bash
cd frontend-react
npm install
npm run dev
```

O frontend fica disponível em `http://localhost:5173`.

## Executando o backend

```bash
cd backend-java
mvn spring-boot:run
```

A API usa `http://localhost:8080`. O endpoint `GET /api/health` pode ser usado para verificar se o serviço iniciou corretamente.

## Estado atual

O frontend permite cadastrar medicamentos, visualizar os horários do dia, pausar tratamentos e registrar doses tomadas. Por enquanto, esses dados ficam no `localStorage` do navegador.

O backend oferece operações básicas de cadastro, consulta, alteração de status e exclusão. Durante o desenvolvimento, os registros são persistidos em um banco H2 local dentro de `backend-java/data`.

## Próximos passos

- Consumir a API Spring Boot no frontend.
- Adicionar migrações versionadas para o banco de dados.
- Associar medicamentos a usuários autenticados.
- Criar histórico de doses e notificações confiáveis.
- Ampliar os testes automatizados.

Este projeto é demonstrativo e não substitui orientação médica.

## Atualizações adicionadas

### Banco de dados de teste

- Inclusão do H2 como banco de dados local para desenvolvimento e testes.
- Persistência dos medicamentos em `backend-java/data/dose-certa.mv.db`.
- Configuração de um banco H2 em memória durante os testes automatizados.
- Disponibilização do console H2 em `http://localhost:8080/h2-console/` enquanto o backend estiver em execução.
- Arquivos locais do banco permanecem fora do Git por meio do `.gitignore`.

### Qualidade e validação

- Testes automatizados do backend executados com Maven.
- Verificação do cadastro, consulta, pausa, retomada e exclusão de medicamentos pela API.
- Validação de respostas para dados inválidos e recursos inexistentes.
- Testes de persistência realizados após a reinicialização do backend.
- Build e verificação de tipos do frontend executados com sucesso.
- CORS validado para a comunicação local entre as portas `5173` e `8080`.

### Observação sobre a integração

O frontend continua armazenando os medicamentos no `localStorage`. A conexão da interface React com a API Spring Boot e o banco H2 permanece como a próxima etapa da aplicação.
