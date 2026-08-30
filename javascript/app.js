document.addEventListener('DOMContentLoaded', () => {
  const time = document.querySelector('#horario');
  const interval = document.querySelector('#intervalo');
  const preview = document.querySelector('#dose-preview');

  function doses() {
    if (!time || !interval || !preview) return;

    let [hour, minute] = time.value.split(':').map(Number);
    const result = [];

    for (let index = 0; index < 4; index += 1) {
      result.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      hour = (hour + Number(interval.value)) % 24;
    }

    preview.textContent = result.join(' · ');
  }

  time?.addEventListener('input', doses);
  interval?.addEventListener('change', doses);
  doses();

  document.querySelectorAll('.choice').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.choice').forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    });
  });

  document.querySelector('#medication-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#medicamento').value.trim();
    if (name) {
      event.target.reset();
      alert(`${name} cadastrado com sucesso!`);
    }
  });

  document.querySelectorAll('.pause-button').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.medicine-card');
      const paused = card.classList.toggle('paused');
      button.textContent = paused ? 'Retomar' : 'Pausar';
      card.querySelector('.pill').textContent = paused ? 'Pausado' : 'Ativo';
    });
  });

  document.querySelectorAll('.delete-button').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('.medicine-card').remove();
      const label = document.querySelector('#med-count');
      if (label) label.textContent = document.querySelectorAll('.medicine-card').length;
    });
  });

  document.querySelectorAll('.take-button').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('.schedule-item').classList.add('taken');
      button.textContent = 'Tomado';
    });
  });
});
