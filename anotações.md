# Notas de desenvolvimento

## Protótipo inicial

- Separei a interface em cadastro, medicamentos, lembretes e configurações.
- Criei um estilo global para manter cores, botões e espaçamentos consistentes.
- Implementei a prévia dos horários com base na primeira dose e no intervalo escolhido.
- Adicionei as ações de pausar, retomar, excluir e marcar uma dose como tomada.
- Ajustei a navegação e o layout para telas pequenas.

## Migração do frontend

- Reorganizei o frontend em componentes, páginas, serviços e tipos.
- Migrei a interface para React e TypeScript sem alterar a proposta visual.
- Adicionei rotas e persistência local para os dados do protótipo.

## Início do backend

- Preparei a estrutura Java em camadas.
- Adicionei uma API Spring Boot básica para medicamentos.
- Mantive o repositório em memória para validar o fluxo antes de escolher o banco de dados.

## Próxima etapa

Integrar o frontend com a API e substituir o armazenamento local por persistência no backend.
