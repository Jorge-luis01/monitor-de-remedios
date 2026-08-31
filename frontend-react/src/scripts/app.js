document.addEventListener('DOMContentLoaded', () => {
  const campoHorario = document.querySelector('#horario');
  const campoIntervalo = document.querySelector('#intervalo');
  const previaDasDoses = document.querySelector('#dose-preview');

  function atualizarProximasDoses() {
    if (!campoHorario || !campoIntervalo || !previaDasDoses) {
      return;
    }

    let [hora, minuto] = campoHorario.value.split(':').map(Number);
    const proximasDoses = [];

    for (let dose = 0; dose < 4; dose += 1) {
      const horaFormatada = String(hora).padStart(2, '0');
      const minutoFormatado = String(minuto).padStart(2, '0');

      proximasDoses.push(`${horaFormatada}:${minutoFormatado}`);
      hora = (hora + Number(campoIntervalo.value)) % 24;
    }

    previaDasDoses.textContent = proximasDoses.join(' · ');
  }

  campoHorario?.addEventListener('input', atualizarProximasDoses);
  campoIntervalo?.addEventListener('change', atualizarProximasDoses);
  atualizarProximasDoses();

  const botoesDeLembrete = document.querySelectorAll('.choice');

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

  const formulario = document.querySelector('#medication-form');

  formulario?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const campoMedicamento = document.querySelector('#medicamento');
    const nomeDoMedicamento = campoMedicamento.value.trim();

    if (!nomeDoMedicamento) {
      return;
    }

    formulario.reset();
    atualizarProximasDoses();
    alert(`${nomeDoMedicamento} cadastrado com sucesso!`);
  });

  document.querySelectorAll('.pause-button').forEach((botao) => {
    botao.addEventListener('click', () => {
      const cartao = botao.closest('.medicine-card');
      const medicamentoPausado = cartao.classList.toggle('paused');
      const situacao = cartao.querySelector('.pill');

      botao.textContent = medicamentoPausado ? 'Retomar' : 'Pausar';
      situacao.textContent = medicamentoPausado ? 'Pausado' : 'Ativo';
    });
  });

  document.querySelectorAll('.delete-button').forEach((botao) => {
    botao.addEventListener('click', () => {
      const cartao = botao.closest('.medicine-card');
      const contador = document.querySelector('#med-count');

      cartao.remove();

      if (contador) {
        contador.textContent = document.querySelectorAll('.medicine-card').length;
      }
    });
  });

  document.querySelectorAll('.take-button').forEach((botao) => {
    botao.addEventListener('click', () => {
      const lembrete = botao.closest('.schedule-item');

      lembrete.classList.add('taken');
      botao.textContent = 'Tomado';
      botao.disabled = true;
    });
  });
});
