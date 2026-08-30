# Dose Certa

Interface web responsiva para cadastrar medicamentos e acompanhar lembretes de doses.

## Funcionalidades

- Cadastro de medicamento, intervalo, duração e horário inicial
- Prévia automática das próximas doses
- Seleção entre alarme e notificação
- Pausar, retomar e excluir medicamentos
- Marcar lembretes como tomados

## Como executar

O projeto não requer instalação. Abra `setores/index.html` em um navegador ou use uma extensão de servidor local, como Live Server, para desenvolvimento.

## Estrutura

- `setores/`: páginas da aplicação
- `visual/`: estilos globais
- `javascript/`: comportamento e interações da interface

## Segurança

Arquivos `.env` e outros dados locais estão excluídos pelo `.gitignore`. Caso futuramente sejam necessárias variáveis de ambiente, use um arquivo `.env.example` sem valores sensíveis como referência.
