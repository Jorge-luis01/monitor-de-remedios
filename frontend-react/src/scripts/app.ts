document.addEventListener('DOMContentLoaded', () => {
  const campoHorario = document.querySelector<HTMLInputElement>('#horario');
  const campoIntervalo = document.querySelector<HTMLSelectElement>('#intervalo');
  const previaDasDoses = document.querySelector<HTMLElement>('#dose-preview');

  function atualizarProximasDoses(): void {
    if (!campoHorario || !campoIntervalo || !previaDasDoses) {
      return;
    }

    const partesDoHorario = campoHorario.value.split(':').map(Number);
    const horaInicial = partesDoHorario[0];
    const minutoInicial = partesDoHorario[1];

    if (
      horaInicial === undefined
      || minutoInicial === undefined
      || !Number.isFinite(horaInicial)
      || !Number.isFinite(minutoInicial)
    ) {
      previaDasDoses.textContent = '';
      return;
    }

    let hora = horaInicial;
    const proximasDoses: string[] = [];

    for (let dose = 0; dose < 4; dose += 1) {
      const horaFormatada = String(hora).padStart(2, '0');
      const minutoFormatado = String(minutoInicial).padStart(2, '0');

      proximasDoses.push(`${horaFormatada}:${minutoFormatado}`);
      hora = (hora + Number(campoIntervalo.value)) % 24;
    }

    previaDasDoses.textContent = proximasDoses.join(' · ');
  }

  campoHorario?.addEventListener('input', atualizarProximasDoses);
  campoIntervalo?.addEventListener('change', atualizarProximasDoses);
  atualizarProximasDoses();

  const botoesDeLembrete = document.querySelectorAll<HTMLButtonElement>('.choice');

  botoesDeLembrete.forEach((botaoSelecionado) => {
    botaoSelecionado.addEventListener('click', () => {
      botoesDeLembrete.forEach((botao) => {
        botao.classList.remove('active');
        botao.setAttribute('aria-pressed', 'false');
      });

      botaoSelecionado.classList.add('active');
      botaoSelecionado.setAttribute('aria-pressed', 'true');
    });
  });

  const formulario = document.querySelector<HTMLFormElement>('#medication-form');

  formulario?.addEventListener('submit', (evento: SubmitEvent) => {
    evento.preventDefault();

    const campoMedicamento = document.querySelector<HTMLInputElement>('#medicamento');
    const nomeDoMedicamento = campoMedicamento?.value.trim() ?? '';

    if (!nomeDoMedicamento) {
      return;
    }

    formulario.reset();
    atualizarProximasDoses();
    window.alert(`${nomeDoMedicamento} cadastrado com sucesso!`);
  });

  document.querySelectorAll<HTMLButtonElement>('.pause-button').forEach((botao) => {
    botao.addEventListener('click', () => {
      const cartao = botao.closest<HTMLElement>('.medicine-card');
      const situacao = cartao?.querySelector<HTMLElement>('.pill');

      if (!cartao || !situacao) {
        return;
      }

      const medicamentoPausado = cartao.classList.toggle('paused');
      botao.textContent = medicamentoPausado ? 'Retomar' : 'Pausar';
      situacao.textContent = medicamentoPausado ? 'Pausado' : 'Ativo';
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.delete-button').forEach((botao) => {
    botao.addEventListener('click', () => {
      const cartao = botao.closest<HTMLElement>('.medicine-card');
      const contador = document.querySelector<HTMLElement>('#med-count');

      if (!cartao) {
        return;
      }

      cartao.remove();

      if (contador) {
        contador.textContent = String(
          document.querySelectorAll<HTMLElement>('.medicine-card').length,
        );
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.take-button').forEach((botao) => {
    botao.addEventListener('click', () => {
      const lembrete = botao.closest<HTMLElement>('.schedule-item');

      if (!lembrete) {
        return;
      }

      lembrete.classList.add('taken');
      botao.textContent = 'Tomado';
      botao.disabled = true;
    });
  });
});
