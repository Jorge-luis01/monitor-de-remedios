# Dose Certa

Aplicação web responsiva em React e TypeScript para cadastrar medicamentos e acompanhar lembretes de doses.

> Projeto demonstrativo. Não substitui orientação de profissionais de saúde e ainda não possui notificações em segundo plano.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router
- Lucide React
- CSS responsivo

## O que foi modificado

- A estrutura anterior, formada por quatro arquivos HTML separados, foi substituída por uma aplicação React de página única.
- O arquivo principal `src/scripts/app.ts` foi dividido em componentes, páginas, contexto, serviços e tipos.
- A inicialização manual do JavaScript foi substituída pelo ponto de entrada React `src/main.tsx`.
- A troca de páginas por links entre arquivos HTML foi substituída pelo React Router.
- As rotas usam `HashRouter`, evitando erros de página não encontrada em hospedagens estáticas.
- Os dados estáticos de medicamentos e lembretes foram convertidos em estado React compartilhado.
- As manipulações diretas do DOM, como `querySelector`, `classList` e alteração de `textContent`, foram substituídas por estado, propriedades e renderização declarativa.
- O JavaScript compilado que ficava em `public/app.js` deixou de ser mantido manualmente; agora o Vite gera os arquivos de produção.
- O `tsconfig.json` foi atualizado para trabalhar com arquivos `.tsx`, módulos ESNext, JSX do React e verificação estrita de tipos.
- O `package.json` passou a incluir os comandos de desenvolvimento, build, prévia e validação de tipos.
- O arquivo `confing.html` e seu nome incorreto foram substituídos pela rota `#/configuracoes` e pelo componente `ConfiguracoesPage.tsx`.
- O CSS existente foi adaptado para componentes React, ícones, mensagens, estados vazios, switches e foco de teclado.

## Adições desta versão

- `App.tsx` para organizar todas as rotas da aplicação.
- `AppLayout.tsx` para compartilhar o conteúdo principal e a navegação inferior.
- `PageHeader.tsx` para padronizar os cabeçalhos das telas.
- `MedicationContext.tsx` para centralizar medicamentos, doses tomadas e preferências.
- Tipos TypeScript para medicamentos, formulário, lembretes e configurações.
- Serviço de armazenamento com tratamento de erros do `localStorage`.
- Serviço para calcular horários, data atual, duração do tratamento e lembretes diários.
- Cadastro funcional com campo separado para a dose do medicamento.
- Redirecionamento e mensagem de sucesso após um cadastro.
- Persistência de medicamentos, pausas, preferências e doses tomadas após atualizar a página.
- Contagem dinâmica e pluralização de medicamentos ativos.
- Confirmação antes da exclusão de um medicamento.
- Estado vazio para listas sem medicamentos ou lembretes.
- Data atual exibida automaticamente na tela de lembretes.
- Destaque automático da próxima dose ainda não tomada.
- Preferência de textos ampliados.
- Ícones acessíveis fornecidos pelo Lucide React.
- Metadados básicos de descrição e cor do tema no HTML principal.

## Funcionalidades

- Cadastro de medicamento com nome, dose, intervalo, duração e horário inicial.
- Prévia automática das próximas doses.
- Seleção entre alarme e notificação.
- Listagem compartilhada entre as telas.
- Pausa, retomada e exclusão com confirmação.
- Geração dinâmica dos lembretes do dia.
- Registro de doses tomadas.
- Contagem correta de medicamentos ativos.
- Configuração de som e textos ampliados.
- Persistência local dos dados e preferências no navegador.
- Estados vazios e mensagens de sucesso.

## Como executar

É necessário ter uma versão do Node.js compatível com o Vite 8.

```bash
npm install
npm run dev
```

O terminal exibirá o endereço local da aplicação.

## Comandos

```bash
npm run dev        # inicia o servidor de desenvolvimento
npm run build      # valida os tipos e gera a versão de produção
npm run preview    # abre uma prévia da versão de produção
npm run typecheck  # verifica somente os tipos
```

## Estrutura

- `src/components/`: componentes compartilhados de layout e cabeçalho.
- `src/context/`: estado global dos medicamentos e preferências.
- `src/pages/`: telas React da aplicação.
- `src/services/`: armazenamento local e cálculo dos horários.
- `src/styles/`: estilos globais e responsivos.
- `src/types/`: tipos e contratos TypeScript.
- `public/`: arquivos públicos estáticos.

## Rotas

- `#/`: cadastro de medicamento.
- `#/medicamentos`: medicamentos cadastrados.
- `#/lembretes`: doses programadas para o dia.
- `#/configuracoes`: preferências da aplicação.

O projeto usa rotas com hash para funcionar em hospedagens estáticas sem configuração adicional no servidor.

## Segurança e limitações

Os dados ficam apenas no `localStorage` do navegador. Não há autenticação, sincronização com servidor ou backup em nuvem.

Antes de uma publicação real, ainda será necessário implementar uma API segura, autenticação, proteção dos dados de saúde, política de privacidade e notificações confiáveis em segundo plano.
