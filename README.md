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

O backend oferece operações básicas de cadastro, consulta, alteração de status e exclusão. O repositório é mantido em memória, portanto os registros são perdidos quando a API reinicia.

## Próximos passos

- Consumir a API Spring Boot no frontend.
- Adicionar banco de dados e migrações.
- Associar medicamentos a usuários autenticados.
- Criar histórico de doses e notificações confiáveis.
- Ampliar os testes automatizados.

Este projeto é demonstrativo e não substitui orientação médica.
