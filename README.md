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

## Adições de segurança — setembro de 2026

- API local protegida por token configurado no ambiente, restrita a loopback por padrão, com limite de requisições e cabeçalhos de proteção. Sem token configurado, o CRUD fica bloqueado. Veja `backend-java/README.md`.
- Console H2 desativado. Configuração opcional de senha via ambiente sem modificar automaticamente bancos existentes.
- Android: backups e transferência de dados desativados por regras explícitas; tráfego HTTP sem criptografia bloqueado; compartilhamento de arquivos restrito a uma subpasta de cache.
- Notificações solicitam conteúdo privado na tela bloqueada, com versão pública genérica. O comportamento final depende das configurações do Android e do usuário.
- Dados locais validados antes de uso. Conteúdo inválido não é substituído automaticamente; falhas de gravação e de sincronização geram avisos na interface.
- Cronograma único entre interface e Android, incluindo doses após a meia-noite e identificação consistente de doses tomadas. Alterações nas doses tomadas passam a atualizar os alarmes nativos.
- Ponte Android valida identificadores, duplicatas, tamanhos e datas antes de trocar o agendamento. Lembretes removidos também cancelam a notificação correspondente.
- Alterações são persistidas antes de chegar ao estado e aos alarmes; falhas preservam o agendamento anterior. Entradas e quantidade total de lembretes são verificadas antes do cadastro ou da retomada.
- Cotas públicas, rejeitadas e autenticadas da API são independentes. A interface web aplica uma política de segurança de conteúdo restritiva.
- Testes de regressão: `npm test` no frontend (Node 24) e `mvn test` no backend.

### Limitações que permanecem

O armazenamento local não ganhou criptografia própria nem bloqueio biométrico. A API
ainda não possui usuários/permissões por registro, paginação ou proteção de borda
adequada a exposição pública. O limite nativo de 1.000 lembretes continua existindo:
um cadastro ou retomada que o excederia é rejeitado antes de alterar os dados e alarmes;
ainda é necessário implementar agendamento incremental para tratamentos maiores. APK de debug não é uma
versão de produção; publicação requer assinatura release e testes em aparelho físico.

As regras Android seguem a documentação de
[backup](https://developer.android.com/identity/data/autobackup) e de
[privacidade das notificações](https://developer.android.com/develop/ui/compose/notifications/create-notification).

### Validação desta atualização

- Backend: 14 testes aprovados, incluindo isolamento das cotas, acesso HTTP real com e sem token e rejeição CORS.
- Frontend: 7 testes aprovados, verificação TypeScript e build de produção concluídos.
- Android: sincronização Capacitor concluída; Java e recursos compilaram na primeira tentativa. O empacotamento falhou ao acessar um asset na pasta OneDrive. A tentativa dos testes unitários também encontrou arquivos de build bloqueados. Portanto, APK e testes Android completos não estão validados nesta atualização, nem houve teste em aparelho físico.
