"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const campoHorario = document.querySelector('#horario');
    const campoIntervalo = document.querySelector('#intervalo');
    const previaDasDoses = document.querySelector('#dose-preview');
    function atualizarProximasDoses() {
        if (!campoHorario || !campoIntervalo || !previaDasDoses) {
            return;
        }
        const partesDoHorario = campoHorario.value.split(':').map(Number);
        const horaInicial = partesDoHorario[0];
        const minutoInicial = partesDoHorario[1];
        if (horaInicial === undefined
            || minutoInicial === undefined
            || !Number.isFinite(horaInicial)
            || !Number.isFinite(minutoInicial)) {
            previaDasDoses.textContent = '';
            return;
        }
        let hora = horaInicial;
        const proximasDoses = [];
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
        const nomeDoMedicamento = campoMedicamento?.value.trim() ?? '';
        if (!nomeDoMedicamento) {
            return;
        }
        formulario.reset();
        atualizarProximasDoses();
        window.alert(`${nomeDoMedicamento} cadastrado com sucesso!`);
    });
    document.querySelectorAll('.pause-button').forEach((botao) => {
        botao.addEventListener('click', () => {
            const cartao = botao.closest('.medicine-card');
            const situacao = cartao?.querySelector('.pill');
            if (!cartao || !situacao) {
                return;
            }
            const medicamentoPausado = cartao.classList.toggle('paused');
            botao.textContent = medicamentoPausado ? 'Retomar' : 'Pausar';
            situacao.textContent = medicamentoPausado ? 'Pausado' : 'Ativo';
        });
    });
    document.querySelectorAll('.delete-button').forEach((botao) => {
        botao.addEventListener('click', () => {
            const cartao = botao.closest('.medicine-card');
            const contador = document.querySelector('#med-count');
            if (!cartao) {
                return;
            }
            cartao.remove();
            if (contador) {
                contador.textContent = String(document.querySelectorAll('.medicine-card').length);
            }
        });
    });
    document.querySelectorAll('.take-button').forEach((botao) => {
        botao.addEventListener('click', () => {
            const lembrete = botao.closest('.schedule-item');
            if (!lembrete) {
                return;
            }
            lembrete.classList.add('taken');
            botao.textContent = 'Tomado';
            botao.disabled = true;
        });
    });
});
