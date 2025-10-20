'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // É CRÍTICO que bank-system.js seja carregado antes deste arquivo para que getCurrentAccount exista.
    if (typeof getCurrentAccount !== 'function') {
        console.error('Erro: bank-system.js não foi carregado corretamente.');
        return;
    }

    const currentAccount = getCurrentAccount();

    if (currentAccount) {
        renderDepositPage(currentAccount);
    }
});

// FUNÇÃO PARA RENDERIZAR A PÁGINA DE DEPÓSITO
function renderDepositPage(account) {
    const agencyEl = document.getElementById('detail-agency');
    const accountEl = document.getElementById('detail-account');
    const ownerEl = document.getElementById('detail-owner');
    const pixCopyEl = document.getElementById('pix-copia-cola');

    if (!agencyEl || !accountEl) return;
    
    // Formatação do número da conta (ex: 12345-6)
    const formattedAccount = account.account.toString().slice(0, 5) + '-' + account.account.toString().slice(5);
    
    // 1. Dados da Conta Tradicional
    agencyEl.textContent = account.agency;
    accountEl.textContent = formattedAccount;
    
    // Mostra apenas o primeiro e o último nome (para caber na grade)
    const ownerParts = account.owner.split(' ');
    ownerEl.textContent = `${ownerParts[0]} ${ownerParts[ownerParts.length - 1]}`;
    
    // 2. Simulação da Chave PIX Copia e Cola
    // Simulação de um código PIX (que conteria o CNPJ/CPF do banco e a chave)
    const pixDataSimulated = `BR.GOV.BCB.PIX01.${account.agency}.${account.account}.${Math.random().toString(36).substring(7).toUpperCase()}`; 
    pixCopyEl.value = pixDataSimulated;

    // 3. Simulação do QR Code (Substitui o placeholder)
    const qrPlaceholder = document.getElementById('qrcode-canvas');
    if (qrPlaceholder) {
        qrPlaceholder.innerHTML = `<i class="fas fa-qrcode" style="font-size: 3em;"></i>`;
        qrPlaceholder.style.backgroundColor = '#fff';
        qrPlaceholder.querySelector('i').style.color = '#388e3c'; // Verde Pineapple
    }
}

// Função utilitária para copiar texto (mantida no HTML para simplicidade de evento onclick)
// function copyToClipboard(elementId) { ... }