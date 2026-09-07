# Frontend

Interface do Dose Certa construída com React, TypeScript e Vite.

## Funcionalidades

- Cadastro de medicamento, dose, intervalo, duração e horário inicial.
- Cálculo dos horários das próximas doses.
- Listagem, pausa, retomada e exclusão de medicamentos.
- Registro das doses tomadas no dia.
- Alarmes e notificações locais no Android, inclusive com o aplicativo fechado.
- Solicitação da permissão de notificações nas versões recentes do Android.
- Agendamento exato quando autorizado e restauração após reiniciar o dispositivo.
- Seleção persistente do toque pelo seletor de sons do Android.
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
npm run android:sync
npm run android:apk
```

## Organização

- `src/components`: componentes compartilhados.
- `src/context`: estado dos medicamentos e preferências.
- `src/pages`: telas da aplicação.
- `src/services`: horários e armazenamento local.
- `src/types`: contratos TypeScript.
- `android/app/src/main/java`: plugin Capacitor, agendador e receivers nativos.

As rotas usam `HashRouter`, o que permite publicar o build em uma hospedagem estática sem regras adicionais de redirecionamento.

## Alarmes no Android

No primeiro uso, o aplicativo solicita a permissão de notificações. Em Android 12 ou superior, alarmes pontuais também podem exigir a autorização especial **Alarmes e lembretes**. As duas situações aparecem na tela **Configurações**, onde também é possível abrir os ajustes do Android e escolher o toque.

Quando a autorização de alarmes exatos não é concedida, o aplicativo usa o agendamento compatível oferecido pelo sistema, que pode sofrer atraso durante economia de bateria. Fabricantes que aplicam restrições adicionais podem exigir que o Dose Certa seja liberado manualmente nas configurações de bateria.

Os agendamentos ficam persistidos no aparelho e são restaurados após a reinicialização. Forçar a parada do aplicativo nas configurações do Android suspende os receivers até que ele seja aberto novamente, conforme o comportamento de segurança do sistema.

## Limitações

O frontend ainda não consome a API do projeto e o backup em nuvem continua planejado. Os dados e agendamentos atuais ficam somente no dispositivo.
