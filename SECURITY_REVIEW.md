# Revisão e correções de segurança — Dose Certa

Data: 12/09/2026. Escopo: React, persistência no navegador, API Spring Boot/H2, ponte Capacitor e Android. A análise considerou a árvore de trabalho atual, inclusive alterações ainda não versionadas.

## Resultado

Não foi encontrado acesso não autenticado aos medicamentos na configuração padrão. O backend permanece restrito a loopback, exige token no CRUD e falha fechado sem credencial configurada.

Os problemas confirmados de disponibilidade e integridade foram corrigidos:

- **Rate limit isolado:** chamadas autenticadas, credenciais rejeitadas e rotas públicas usam cotas independentes. Uma rajada pública ou sem token não bloqueia mais o cliente autenticado.
- **Validação antes da mutação:** nome, dose, campos de tratamento, quantidade de medicamentos e total de lembretes são verificados antes de alterar estado ou mostrar sucesso.
- **Persistência antes dos alarmes:** uma operação só altera o estado React depois que o armazenamento confirma a gravação. Falhas de quota bloqueiam a sincronização nativa e podem ser recuperadas por uma tentativa posterior bem-sucedida.
- **Cronograma limitado:** a geração futura para ao detectar 1.001 lembretes, sem materializar centenas de milhares de objetos. Cadastros e retomadas que ultrapassariam 1.000 são rejeitados antes de alterar dados ou alarmes.
- **Atualização nativa recuperável:** o Android agenda o novo conjunto antes de cancelar lembretes removidos. Se a atualização falhar, restaura a lista e tenta reagendar o conjunto anterior. Atualizações concorrentes são serializadas.
- **Notificações sem colisão por hash:** a identidade usa o ID textual completo; a ação de dispensar também possui action exclusiva. A limpeza mantém compatibilidade com notificações criadas por versões anteriores.
- **CSP no frontend:** scripts, imagens, fontes, conexões e objetos receberam uma política explícita compatível com o aplicativo offline e o servidor local de desenvolvimento.
- **Documentação H2 corrigida:** foi removida a instrução contraditória que dizia que o console desativado ainda poderia ser acessado.

## Validação executada

- Backend: 14 testes aprovados, incluindo separação das cotas, autenticação HTTP e CORS.
- Frontend: 7 testes aprovados, TypeScript sem erros e build Vite de produção concluído.
- `npm audit --json --ignore-scripts`: nenhuma vulnerabilidade conhecida reportada em 165 dependências durante a análise inicial.
- Android: compilação e testes Gradle são registrados no resultado final desta alteração.
- `git diff --check`: sem erros de whitespace; avisos de normalização CRLF permanecem por configuração do Git no Windows.

## Riscos residuais

O aplicativo continua sendo um produto local e individual. Estes pontos exigem arquitetura, infraestrutura ou escolha explícita de experiência do usuário:

- Medicamentos ficam no armazenamento privado do navegador/WebView e em SharedPreferences sem criptografia adicional implementada pelo app. Backups Android e transferência de dados estão desativados, e a sandbox/criptografia do sistema continuam sendo a proteção principal. Bloqueio biométrico ou por senha precisa de um fluxo de recuperação e não foi imposto automaticamente.
- O arquivo H2 não usa criptografia de arquivo. A variável de senha controla autenticação do banco, mas não cifra um banco existente. Habilitar `CIPHER` exige migração planejada e credencial de arquivo separada.
- A API usa um único token, sem usuários, expiração, escopos ou autorização por registro. Isso corresponde ao modelo individual documentado. Antes de uso multiusuário, são necessários identidade, autorização por proprietário, rotação de credenciais e trilha de auditoria.
- A API usa HTTP porque escuta apenas no loopback. Antes de alterar o bind para rede, é obrigatório colocar TLS, limites de borda, quotas, limites de corpo/conexões e paginação.
- O limite de 1.000 lembretes agora falha antes da mutação e preserva o estado anterior. Para tratamentos maiores, ainda é necessário um agendamento incremental confiável.
- Uma versão publicável precisa de assinatura release, inspeção do manifesto/APK final e teste em aparelho real. A tarefa não publica nem assina APK.

## Proteções presentes

- Console H2 desativado; mensagens e stack traces não são enviados nas respostas.
- DTOs do backend possuem limites de tamanho e intervalo; o acesso ao banco usa Spring Data sem SQL montado com entrada do usuário.
- Renderização por JSX, sem `dangerouslySetInnerHTML`, `eval` ou montagem direta de HTML identificada.
- Receivers e FileProvider não exportados; PendingIntents imutáveis; compartilhamento restrito a uma subpasta de cache.
- Backup e transferência Android desativados; tráfego HTTP em claro bloqueado no APK; notificações usam conteúdo público genérico na tela bloqueada.
- Nenhum segredo real foi identificado nos arquivos de configuração examinados. Tokens presentes nos testes são fictícios.

O próximo nível de endurecimento deve começar pela definição do modelo de ameaça dos dados médicos locais e pelo ambiente real de publicação. Sem essas decisões, adicionar criptografia com uma chave armazenada ao lado dos dados criaria apenas uma aparência de proteção.
