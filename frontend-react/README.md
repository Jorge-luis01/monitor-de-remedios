# Dose Certa

Interface web responsiva para cadastrar medicamentos e acompanhar lembretes de doses.

> Status: protótipo de interface. Ainda não está pronto para produção nem substitui orientação de profissionais de saúde.

## escritas
- usei ia pa descrever as funcionalidades 

## Funcionalidades atuais

- Formulário com nome do medicamento, intervalo entre doses, duração e horário inicial.
- Prévia automática das quatro próximas doses conforme o horário e o intervalo selecionados.
- Seleção visual entre alarme e notificação.
- Tela de medicamentos com ações visuais de pausar, retomar e excluir.
- Tela de lembretes com ação de marcar uma dose como tomada.
- Layout responsivo para dispositivos móveis, com navegação fixa na parte inferior.

## Alterações realizadas

- Reorganização do front-end em `src/pages`, `src/styles` e `src/scripts`, preparando o projeto para uma futura migração para React.
- Padronização dos nomes e variáveis do JavaScript em português para facilitar a manutenção.
- Após cadastrar, o formulário é limpo e a prévia das doses é atualizada.
- Ao marcar um lembrete como tomado, o botão é desabilitado para impedir o registro duplicado durante a sessão.
- Inclusão de melhorias iniciais de acessibilidade: idioma da página, `aria-live` na prévia das doses e rótulo na navegação principal.
- Inclusão de `.gitignore` para arquivos de ambiente, dependências, artefatos de build, logs e anotações locais.

## Ajustes planejados antes de produção

- Persistir medicamentos, pausas e doses tomadas em uma API e banco de dados; atualmente as alterações se perdem ao atualizar a página.
- Fazer o cadastro criar o medicamento, suas doses e os lembretes nas telas correspondentes; hoje ele apenas confirma visualmente o envio.
- Implementar edição de medicamentos e confirmação ou opção de desfazer antes da exclusão.
- Usar a quantidade de dias para calcular o término do tratamento e encerrar lembretes automaticamente.
- Exibir data junto aos horários que atravessam a meia-noite.
- Criar alarmes e notificações reais, incluindo solicitação de permissão e tratamento de indisponibilidade no dispositivo.
- Tornar as opções de Configurações funcionais e persistentes.
- Adicionar testes automatizados, testes de acessibilidade, validação em celulares reais e um ambiente de homologação.
- Renomear `confing.html` para um nome sem erro tipográfico antes de definir rotas públicas.

## Como executar

O projeto atual não requer instalação. Para desenvolvimento, abra `src/pages/index.html` em um navegador ou use uma extensão de servidor local, como o Live Server.

## Estrutura

- `src/pages/`: páginas da aplicação.
- `src/styles/`: estilos globais.
- `src/scripts/`: comportamento e interações da interface.
- `src/components/`, `src/services/`, `src/types/` e `src/assets/`: diretórios reservados para a evolução para React.
- `public/`: arquivos públicos da aplicação.

## Segurança

Arquivos `.env` e outros dados locais estão excluídos pelo `.gitignore`. Caso sejam necessárias variáveis de ambiente, use um arquivo `.env.example` sem valores sensíveis como referência.

Como o protótipo ainda não possui autenticação, API ou persistência, esses controles deverão ser definidos antes da publicação: validação no servidor, controle de acesso, proteção de dados de saúde e política de privacidade.
