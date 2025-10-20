'use strict';

// CRÍTICO: Este arquivo depende que bank-system.js tenha sido carregado antes.

// SIMULAÇÃO DE DADOS DE BOLETO
const simulatedBoleto = {
    codigo: "00190.00000 00000.000000 00000.000000 0 00000000000000",
    beneficiario: "Companhia Elétrica S.A.",
    vencimento: "25/10/2025",
    valor: 450.50
};


function simularLeituraBoleto() {
    const codigoInput = document.getElementById('codigo-barras');
    const detalhesArea = document.getElementById('boleto-details-area');
    const pagarBtn = document.getElementById('confirmar-pagamento-btn');
    const saldoInfoEl = document.getElementById('saldo-info');

    // Remove caracteres não-numéricos (simulação de tratamento de linha digitável)
    const codigoDigitado = codigoInput.value.replace(/[^0-9]/g, ''); 
    
    // Simulação de verificação de código
    if (codigoDigitado.length < 47 || codigoDigitado.length > 50) {
        alert("Código de barras inválido. Insira um código de 47 ou 48 dígitos para simular.");
        detalhesArea.classList.add('hidden');
        return;
    }

    // Preenche os detalhes simulados
    document.getElementById('detail-beneficiario').textContent = simulatedBoleto.beneficiario;
    document.getElementById('detail-vencimento').textContent = simulatedBoleto.vencimento;
    document.getElementById('detail-valor').textContent = formatCurrency(simulatedBoleto.valor);
    document.getElementById('detail-multa').textContent = "R$ 0,00"; 

    // Atualiza o saldo e mostra os detalhes
    const currentAccount = getCurrentAccount();
    
    // Verifica se há saldo suficiente para o pagamento
    if (currentAccount.balance >= simulatedBoleto.valor) {
        pagarBtn.disabled = false;
        pagarBtn.textContent = `Confirmar Pagamento de ${formatCurrency(simulatedBoleto.valor)}`;
        saldoInfoEl.textContent = `Seu saldo: ${formatCurrency(currentAccount.balance)}`;
        saldoInfoEl.style.color = 'var(--verde-principal)';
        saldoInfoEl.style.backgroundColor = '#e6f7e9';
    } else {
        pagarBtn.disabled = true;
        pagarBtn.textContent = `Saldo Insuficiente`;
        saldoInfoEl.textContent = `Seu saldo: ${formatCurrency(currentAccount.balance)} (INSUFICIENTE)`;
        saldoInfoEl.style.color = 'var(--cor-despesa)';
        saldoInfoEl.style.backgroundColor = '#fce7e7';
    }

    detalhesArea.classList.remove('hidden');
}


function confirmarPagamento() {
    const valorPagar = simulatedBoleto.valor;
    const beneficiario = simulatedBoleto.beneficiario;

    // Acessa as funções do bank-system.js
    let bankData = loadBankData();
    let currentUser = getCurrentAccount();
    const currentAccountKey = currentUser.agency + '-' + currentUser.account;

    if (currentUser.balance < valorPagar) {
        alert("Erro: Saldo insuficiente. O pagamento foi interrompido.");
        return;
    }

    // 1. Débito da conta
    currentUser.balance = parseFloat((currentUser.balance - valorPagar).toFixed(2));
    
    // 2. Adiciona a transação ao extrato
    currentUser.transactions.push({
        id: Date.now(),
        type: 'debit',
        description: `Pagamento: ${beneficiario}`,
        amount: valorPagar,
        date: new Date().toLocaleDateString('pt-BR')
    });

    // 3. Salva e Notifica
    bankData.accounts[currentAccountKey] = currentUser;
    saveBankData(bankData);

    alert(`Pagamento de ${formatCurrency(valorPagar)} para ${beneficiario} realizado com sucesso!`);
    window.location.href = 'conta.html'; // Volta para o dashboard
}


document.addEventListener('DOMContentLoaded', () => {
    // É CRÍTICO que bank-system.js esteja carregado para a função getCurrentAccount existir.
    if (typeof getCurrentAccount !== 'function') return;

    const currentAccount = getCurrentAccount();
    if (!currentAccount) return; 
    
    const isPagarPage = document.body.classList.contains('page-pagar');

    if (isPagarPage) {
        document.getElementById('simular-leitura-btn').addEventListener('click', simularLeituraBoleto);
        document.getElementById('confirmar-pagamento-btn').addEventListener('click', confirmarPagamento);
        
        const codigoBarrasInput = document.getElementById('codigo-barras');
        const saldoInfoEl = document.getElementById('saldo-info');

        // Lógica de alternância (Camera/Digitar)
        document.getElementById('btn-digitar').addEventListener('click', (e) => {
            document.getElementById('btn-camera').classList.remove('active');
            e.target.classList.add('active');
            codigoBarrasInput.placeholder = "Digite o código de barras aqui...";
            document.getElementById('boleto-details-area').classList.add('hidden');
        });

        document.getElementById('btn-camera').addEventListener('click', (e) => {
            document.getElementById('btn-digitar').classList.remove('active');
            e.target.classList.add('active');
            codigoBarrasInput.placeholder = "Aponte a câmera para o código...";
            document.getElementById('boleto-details-area').classList.add('hidden');
        });
        
        // Preenche o saldo inicial para UX
        if(saldoInfoEl) saldoInfoEl.textContent = `Seu saldo: ${formatCurrency(currentAccount.balance)}`;
    }
});