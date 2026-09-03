# Frontend

Interface do Dose Certa construída com React, TypeScript e Vite.

## Funcionalidades

- Cadastro de medicamento, dose, intervalo, duração e horário inicial.
- Cálculo dos horários das próximas doses.
- Listagem, pausa, retomada e exclusão de medicamentos.
- Registro das doses tomadas no dia.
- Preferência de texto ampliado.
- Persistência local no navegador.

## Desenvolvimento

```bash
npm install
npm run dev
```

Outros comandos disponíveis:

```bash
npm run typecheck
npm run build
npm run preview
```

## Organização

- `src/components`: componentes compartilhados.
- `src/context`: estado dos medicamentos e preferências.
- `src/pages`: telas da aplicação.
- `src/services`: horários e armazenamento local.
- `src/types`: contratos TypeScript.

As rotas usam `HashRouter`, o que permite publicar o build em uma hospedagem estática sem regras adicionais de redirecionamento.

## Limitações

O frontend ainda não consome a API do projeto. Alarmes, notificações e backup em nuvem aparecem apenas como recursos planejados.
