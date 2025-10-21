'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Lógica de ATIVAÇÃO DO MODAL DE CONTATO (Para ambas as páginas de Marketing)
    const btnContato = document.getElementById('btn-contato');
    const modalContato = document.getElementById('modal-contato');
    const btnFecharContato = document.getElementById('close-contato-btn');

    if (btnContato && modalContato && btnFecharContato) {
        // Abre o modal
        btnContato.addEventListener('click', (e) => {
            e.preventDefault();
            modalContato.classList.remove('hidden');
        });
        
        // Fecha o modal pelo botão X
        btnFecharContato.addEventListener('click', () => {
            modalContato.classList.add('hidden');
        });
        
        // Fecha o modal ao clicar no fundo
        modalContato.addEventListener('click', (e) => {
            if (e.target === modalContato) {
                modalContato.classList.add('hidden');
            }
        });
    }
});