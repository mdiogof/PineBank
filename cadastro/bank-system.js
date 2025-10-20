'use strict';

// ----------------------------------------------------------------------
// 1. DADOS INICIAIS DE SIMULAÇÃO (CONTAS DE TESTE)
// ----------------------------------------------------------------------

const initialBankData = {
    accounts: {
        "0001-123456": {
            owner: "Brendo Ryan Da Costa Manoel",
            agency: "0001",
            account: "123456",
            balance: 4150.22, 
            loanLimit: 15000.00,
            cardData: { 
                physicalNum: '4567 • 8901 • 2345 • 1234', 
                virtualNum: '4567 • 8901 • 2345 • 5678', // Número completo salvo inicial
                virtualCvv: '987',
                validity: '01/29'
            },
            transactions: [
                { id: 1, type: "debit", amount: 150.00, description: "Compra Online Magazine", date: "18/10/2025 10:00" },
                { id: 2, type: "credit", amount: 2500.00, description: "Salário Setembro", date: "15/10/2025 12:00" },
                { id: 3, type: "debit", amount: 1000.00, description: "Pix para Diogo - presente", date: "18/10/2025 10:00" },
                { id: 4, type: "debit", amount: 500.00, description: "Pix para Diogo - presente", date: "18/10/2025 10:00" },
            ]
        },
        "0001-654321": {
            owner: "Maria Luiza Silva",
            agency: "0001",
            account: "654321",
            balance: 1200.00,
            loanLimit: 7500.00,
            cardData: {
                physicalNum: '1111 • 2222 • 3333 • 4444', 
                virtualNum: '4567 • 8901 • 2345 • 9090', 
                virtualCvv: '555',
                validity: '05/28'
            },
            transactions: []
        },
        "0001-987654": {
            owner: "Diogo Melo Ferraz",
            agency: "0001",
            account: "987654",
            balance: 350.50,
            loanLimit: 3000.00,
            cardData: {
                physicalNum: '9999 • 8888 • 7777 • 6666', 
                virtualNum: '4567 • 8901 • 2345 • 1010', 
                virtualCvv: '333',
                validity: '03/27'
            },
            transactions: []
        }
    },
    currentUserKey: null 
};

// ----------------------------------------------------------------------
// 2. FUNÇÕES DE DADOS (CARREGAMENTO E SALVAMENTO)
// ----------------------------------------------------------------------

function saveBankData(data) {
    localStorage.setItem('bankData', JSON.stringify(data));
}

function loadBankData() {
    const data = localStorage.getItem('bankData');
    if (data) {
        return JSON.parse(data);
    } else {
        saveBankData(initialBankData);
        return initialBankData;
    }
}

function getCurrentAccount() {
    const bankData = loadBankData();
    const loggedUser = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (loggedUser) {
        const agencia = loggedUser.agencia ? loggedUser.agencia.toString().padStart(4, '0') : "0001";
        const conta = (loggedUser.conta || loggedUser.account).toString().padStart(6, '0');

        const accountKey = `${agencia}-${conta}`;
        
        if (!bankData.accounts[accountKey]) {
             bankData.accounts[accountKey] = {
                 owner: loggedUser.nome,
                 agency: agencia,
                 account: conta,
                 balance: 0.00, 
                 loanLimit: 5000.00, 
                 cardData: initialBankData.accounts["0001-123456"].cardData // Usa o cardData padrão
             };
             saveBankData(bankData);
        }
        
        bankData.currentUserKey = accountKey;
        saveBankData(bankData);
        return bankData.accounts[accountKey];
    }
    return null; 
}

// Expõe funções globalmente
window.loadBankData = loadBankData;
window.saveBankData = saveBankData;
window.getCurrentAccount = getCurrentAccount;


// ----------------------------------------------------------------------
// 3. LÓGICA DE CARTÕES (Bloqueio, Geração e Exibição)
// ----------------------------------------------------------------------

function toggleCardLock(isPhysical) {
    const statusId = isPhysical ? 'card-status-fisico' : 'card-status-virtual';
    const buttonId = isPhysical ? 'toggle-fisico' : 'regenerate-virtual';
    const cardEl = isPhysical ? document.querySelector('.credit-card.physical') : document.querySelector('.credit-card.virtual');
    
    const statusEl = document.getElementById(statusId);
    const buttonEl = document.getElementById(buttonId);
    
    if (!statusEl || !buttonEl || !cardEl) return; 

    const isActive = statusEl.classList.contains('status-active');

    if (isActive) {
        // Bloquear
        statusEl.textContent = 'BLOQUEADO';
        statusEl.classList.remove('status-active');
        statusEl.classList.add('status-locked');
        buttonEl.innerHTML = '<i class="fas fa-unlock"></i> Desbloquear Temporariamente';
        buttonEl.classList.remove('toggle-lock');
        buttonEl.classList.add('action-danger');
        if (cardEl) cardEl.classList.add('locked-card');
        alert("Cartão bloqueado com sucesso. Transações serão negadas.");
        
    } else {
        // Desbloquear
        statusEl.textContent = 'ATIVO';
        statusEl.classList.remove('status-locked');
        statusEl.classList.add('status-active');
        buttonEl.innerHTML = '<i class="fas fa-lock-open"></i> Bloquear Temporariamente';
        buttonEl.classList.remove('action-danger');
        buttonEl.classList.add('toggle-lock');
        if (cardEl) cardEl.classList.remove('locked-card');
        alert("Cartão desbloqueado. Já pode ser usado.");
    }
}

function generateRandomCvv() {
    return Math.floor(100 + Math.random() * 900);
}
function generateRandomCardSegment() {
    return Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
}

function generateNewVirtualCard() {
    const numVirtualEl = document.getElementById('num-virtual');
    const cvvEl = document.getElementById('cvv-virtual');
    const validadeEl = document.getElementById('validade-virtual');
    
    if (!numVirtualEl || !cvvEl || !validadeEl) return;

    let bankData = loadBankData();
    let currentUser = getCurrentAccount();
    const currentAccountKey = currentUser.agencia + '-' + currentUser.account;

    const newLastFour = generateRandomCardSegment();
    const fullNewNumber = `${generateRandomCardSegment()} • ${generateRandomCardSegment()} • ${generateRandomCardSegment()} • ${newLastFour}`; 
    const newCvv = generateRandomCvv();

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const newYear = (nextMonth.getFullYear() + 4).toString().slice(-2);
    const newValidity = `${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}/${newYear}`;

    // 1. Atualiza o Local Storage
    currentUser.cardData.virtualNum = fullNewNumber; 
    currentUser.cardData.virtualCvv = newCvv.toString();
    currentUser.cardData.validity = newValidity;
    bankData.accounts[currentAccountKey] = currentUser;
    saveBankData(bankData);

    // 2. Atualiza a UI para o estado OCULTO com os novos dados
    numVirtualEl.textContent = `•••• •••• •••• ${newLastFour}`; 
    cvvEl.textContent = '***'; // Mantém o CVV oculto
    validadeEl.textContent = newValidity;
    
    alert(`Novo Cartão Virtual gerado! Validade: ${newValidity}. O antigo foi invalidado.`);
}

function toggleCardData(isPhysical) {
    let numEl = isPhysical ? document.getElementById('num-fisico') : document.getElementById('num-virtual');
    let cvvEl = isPhysical ? null : document.getElementById('cvv-virtual');
    let button = isPhysical ? document.getElementById('toggle-fisico-data') : document.getElementById('exibir-dados');
    
    let currentUser = getCurrentAccount(); 
    if (!currentUser || !numEl || !button || !currentUser.cardData) return;
    
    const isHidden = numEl.textContent.startsWith('•');
    
    // Puxa os dados salvos
    const fullNum = isPhysical ? currentUser.cardData.physicalNum : currentUser.cardData.virtualNum;
    const currentCvv = currentUser.cardData.virtualCvv;
    const lastFour = fullNum.slice(-4);
    
    if (isHidden) {
        // EXIBIR DADOS
        numEl.textContent = fullNum;
        if (cvvEl) cvvEl.textContent = currentCvv;
        button.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Dados';
    } else {
        // OCULTAR DADOS
        numEl.textContent = `•••• •••• •••• ${lastFour}`;
        if (cvvEl) cvvEl.textContent = '***'; // Placeholder seguro
        button.innerHTML = '<i class="fas fa-eye"></i> Exibir Dados';
    }
}

function handleConfiguration() {
    alert("Redirecionando para a página de Configurações de Cartão (Simulação).");
}


// ----------------------------------------------------------------------
// 4. LÓGICA DE SOLICITAÇÃO DE CARTÃO (2ª VIA) - NOVO MÓDULO FINAL
// ----------------------------------------------------------------------

function handleCardRequest(e) {
    e.preventDefault(); // CRÍTICO: Impede o recarregamento e resolve o problema de apagar dados
    
    const form = document.getElementById('solicitacao-form');
    const motivo = document.querySelector('input[name="motivo"]:checked');
    const endereco = document.getElementById('endereco').value.trim();

    if (!motivo) {
        alert("Por favor, selecione um motivo.");
        return;
    }
    
    if (!endereco) {
        alert("Confirme o endereço de entrega.");
        return;
    }
    
    // 1. Lógica de Bloqueio (Simulação)
    if (motivo.value === 'roubo') {
        alert("Cartão antigo BLOQUEADO IMEDIATAMENTE por segurança. Um novo será enviado.");
        // Em um sistema real, chamaria toggleCardLock(true) aqui e bloquearia o cartão
    }
    
    // 2. Lógica de Agendamento e Cobrança
    let bankData = loadBankData();
    let currentUser = getCurrentAccount();
    const currentAccountKey = currentUser.agencia + '-' + currentUser.account;
    
    const taxaSegundaVia = (motivo.value === 'dano' || motivo.value === 'novo') ? 15.00 : 0.00;
    
    if (taxaSegundaVia > 0) {
        currentUser.balance = parseFloat((currentUser.balance - taxaSegundaVia).toFixed(2));
        currentUser.transactions.push({
            id: Date.now(),
            type: 'debit',
            description: `Taxa 2ª Via Cartão`,
            amount: taxaSegundaVia,
            date: new Date().toLocaleDateString('pt-BR')
        });
    }

    // Adiciona o agendamento de envio ao extrato (para UX)
    currentUser.transactions.push({
        id: Date.now() + 1,
        type: 'debit', 
        description: `Envio 2ª Via Cartão - Chegada em 10 dias`,
        amount: 0.00,
        date: new Date().toLocaleDateString('pt-BR'),
        isFuture: true
    });
    
    // 3. Salva os dados atualizados
    bankData.accounts[currentAccountKey] = currentUser;
    saveBankData(bankData);
    
    // 4. Atualiza a UI para o modo de confirmação
    const solicitacaoForm = document.getElementById('solicitacao-form');
    if (solicitacaoForm) solicitacaoForm.classList.add('hidden');
    
    document.getElementById('endereco-confirmado').textContent = endereco;
    const confirmacaoArea = document.getElementById('confirmacao-entrega');
    if (confirmacaoArea) confirmacaoArea.classList.remove('hidden');

    alert(`Solicitação enviada! Novo cartão a caminho de ${endereco}.`);
}


// ----------------------------------------------------------------------
// 5. FUNÇÃO DE TRANSFERÊNCIA (LÓGICA PIX)
// ----------------------------------------------------------------------

function transferHandler(e) {
    e.preventDefault();

    const recipientAccKey = document.getElementById('recipient-select').value;
    const amountInput = document.getElementById('transfer-amount').value.replace(',', '.');
    const amount = parseFloat(amountInput);
    const description = document.getElementById('transfer-description').value.trim() || 'Transferência'; 

    if (!recipientAccKey || isNaN(amount) || amount <= 0) {
        alert('Selecione um destinatário e insira um valor válido.');
        return;
    }

    let bankData = loadBankData();
    let allAccounts = bankData.accounts;
    const currentAccountKey = JSON.parse(localStorage.getItem('usuarioLogado')).agencia + '-' + JSON.parse(localStorage.getItem('usuarioLogado')).conta;
    let currentUser = allAccounts[currentAccountKey]; 

    if (currentUser.balance < amount) {
        alert(`Saldo insuficiente. Você possui apenas ${formatCurrency(currentUser.balance)}.`);
        return;
    }

    const recipientAccount = allAccounts[recipientAccKey];
    
    currentUser.balance = parseFloat((currentUser.balance - amount).toFixed(2));
    recipientAccount.balance = parseFloat((recipientAccount.balance + amount).toFixed(2));

    const date = new Date();
    const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const transactionId = Date.now();
    
    const senderName = currentUser.owner.split(' ')[0];
    const recipientName = recipientAccount.owner.split(' ')[0];

    currentUser.transactions.push({
        id: transactionId,
        type: 'debit',
        description: `Pix para ${recipientName} - ${description}`,
        amount: amount,
        date: dateStr
    });

    recipientAccount.transactions.push({
        id: transactionId + 1,
        type: 'credit',
        description: `Pix de ${senderName} - ${description}`,
        amount: amount,
        date: dateStr
    });

    bankData.accounts = allAccounts;
    saveBankData(bankData);
    
    alert(`PIX de ${formatCurrency(amount)} para ${recipientAccount.owner} realizado com sucesso!`);
    window.location.href = 'conta.html';
}

window.transferHandler = transferHandler; 

// ----------------------------------------------------------------------
// 6. LÓGICA DE EMPRÉSTIMO (Cálculo e Contratação)
// ----------------------------------------------------------------------

const LOAN_CONFIG = {
    INTEREST_RATE: 0.015, // 1.5% ao mês
    IOF_DAILY_RATE: 0.000082, 
    IOF_FIXED_RATE: 0.0038,   
};

const calculatePMT = (rateMonthly, periods, presentValue) => {
    const rate = rateMonthly; 
    const numerator = rate * Math.pow(1 + rate, periods);
    const denominator = Math.pow(1 + rate, periods) - 1;
    if (denominator === 0) return presentValue / periods; 
    return (presentValue * numerator) / denominator;
};

function simulateLoan() {
    const valorEl = document.getElementById('valor');
    const parcelasEl = document.getElementById('parcelas');
    const resultsArea = document.getElementById('loan-results');
    
    const V = parseFloat(valorEl.value);
    const N = parseInt(parcelasEl.value);

    const currentAccount = getCurrentAccount();
    if (!currentAccount) return; 
    
    const limit = currentAccount.loanLimit; 
    const limitDisplayEl = document.getElementById('loan-limit-display');
    
    if (limitDisplayEl) {
        limitDisplayEl.innerHTML = `Seu limite de crédito pré-aprovado é de <strong>${formatCurrency(limit)}</strong>.`;
    }
    
    // 2. VALIDAÇÃO PRINCIPAL: Valor ultrapassa o limite?
    if (V > limit) {
        alert(`O valor solicitado (${formatCurrency(V)}) excede seu limite pré-aprovado de ${formatCurrency(limit)}.`);
        if (V > limit) valorEl.value = limit; 
        resultsArea.classList.add('hidden');
        return;
    }

    // Validação básica do formulário
    if (isNaN(V) || V < 1000 || isNaN(N) || N < 1 || V > 20000) {
        resultsArea.classList.add('hidden');
        return;
    }

    // --- 3. CÁLCULO FINANCEIRO ---
    const iofFixo = V * LOAN_CONFIG.IOF_FIXED_RATE;
    const iofDiario = V * LOAN_CONFIG.IOF_DAILY_RATE * (N * 30);
    const iofTotal = iofFixo + iofDiario;
    const taxaJurosMensal = LOAN_CONFIG.INTEREST_RATE;
    const parcela = calculatePMT(taxaJurosMensal, N, V); 
    const valorTotalPagar = parcela * N;
    const custoTotalEfetivo = valorTotalPagar - V + iofTotal;
    const cetAnual = Math.pow(1 + (custoTotalEfetivo / V), 12 / N) - 1; 
    const cetMensalPercentual = (cetAnual / 12) * 100;
    
    // --- 4. PREENCHIMENTO DOS RESULTADOS ---
    document.getElementById('res-valor-solicitado').textContent = formatCurrency(V);
    document.getElementById('res-juros').textContent = (taxaJurosMensal * 100).toFixed(2) + '% a.m.';
    document.getElementById('res-iof').textContent = formatCurrency(iofTotal);
    document.getElementById('res-cet').textContent = cetMensalPercentual.toFixed(2) + '% a.m.';
    document.getElementById('res-parcela').textContent = formatCurrency(parcela);
    document.getElementById('res-total-pagar').textContent = formatCurrency(valorTotalPagar);

    // --- 5. CONFIGURAÇÃO DO BOTÃO CONTRATAR ---
    const contractButton = document.getElementById('contract-button');
    
    contractButton.textContent = `Contratar R$ ${V.toFixed(2).replace('.', ',')} em ${N}x`;
    contractButton.setAttribute('data-loan-value', V);
    contractButton.setAttribute('data-parcel-value', parcela.toFixed(2));
    contractButton.setAttribute('data-parcels', N);

    contractButton.removeEventListener('click', contractLoan); 
    contractButton.addEventListener('click', contractLoan); 

    resultsArea.classList.remove('hidden');
}

function contractLoan(e) {
    e.preventDefault(); 
    
    const contractButton = document.getElementById('contract-button'); 
    
    const valorContratado = parseFloat(contractButton.getAttribute('data-loan-value'));
    const valorParcela = parseFloat(contractButton.getAttribute('data-parcel-value'));
    const numParcelas = parseInt(contractButton.getAttribute('data-parcels'));

    if (isNaN(valorContratado) || !numParcelas) {
        alert("Erro de contratação: Simulação inválida. Por favor, simule novamente.");
        return;
    }

    let bankData = loadBankData();
    let allAccounts = bankData.accounts;
    const loggedUserInfo = JSON.parse(localStorage.getItem('usuarioLogado')); 
    
    if (!loggedUserInfo) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = 'login.html';
        return;
    }
    
    const currentAccountKey = loggedUserInfo.agencia + '-' + loggedUserInfo.conta;
    let currentUser = allAccounts[currentAccountKey]; 

    // Validação de limite
    if (valorContratado > currentUser.loanLimit) {
        alert(`Não é possível contratar: Valor excede seu limite de ${formatCurrency(currentUser.loanLimit)}.`);
        return;
    }
    
    // 1. Crédito do valor do empréstimo na conta
    currentUser.balance += valorContratado;
    currentUser.balance = parseFloat(currentUser.balance.toFixed(2)); 
    
    // 2. CORREÇÃO: Abate o limite disponível
    currentUser.loanLimit = parseFloat((currentUser.loanLimit - valorContratado).toFixed(2));
    if (currentUser.loanLimit < 0) currentUser.loanLimit = 0; 

    // 3. Adiciona a entrada do crédito no extrato
    currentUser.transactions.push({
        id: Date.now(),
        type: 'credit',
        description: `Empréstimo Contratado`,
        amount: valorContratado,
        date: new Date().toLocaleDateString('pt-BR')
    });
    
    // 4. CRIA AS PARCELAS FUTURAS (Débito Automático)
    for (let i = 1; i <= numParcelas; i++) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + i); 
        nextMonth.setDate(5); 

        currentUser.transactions.push({
            id: Date.now() + i, 
            type: 'debit',
            description: `Débito Parcela ${i}/${numParcelas} - Emp. Pessoal`,
            amount: valorParcela,
            date: nextMonth.toLocaleDateString('pt-BR'),
            isFuture: true 
        });
    }

    // 5. Salva no Local Storage
    allAccounts[currentAccountKey] = currentUser;
    saveBankData({ accounts: allAccounts, currentUserKey: currentAccountKey });

    // UX: Adiciona um pequeno delay antes de redirecionar para mostrar o alerta de sucesso
    setTimeout(() => {
        alert(`Empréstimo de ${formatCurrency(valorContratado)} contratado! ${numParcelas} parcelas de ${formatCurrency(valorParcela)} agendadas.`);
        window.location.href = 'conta.html';
    }, 100);
}


// ----------------------------------------------------------------------
// 7. FUNÇÕES DE RENDERIZAÇÃO
// ----------------------------------------------------------------------

function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
}

function displayBalance(account) {
    const balanceEl = document.getElementById('current-balance');
    const toggleButton = document.getElementById('toggle-balance');

    if (!balanceEl) return;

    let isVisible = true;
    let balanceValue = formatCurrency(account.balance);
    let hiddenValue = "R$ -,---.--";

    balanceEl.textContent = balanceValue;

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            isVisible = !isVisible;
            balanceEl.textContent = isVisible ? balanceValue : hiddenValue;
            toggleButton.querySelector('i').className = isVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }
}

function displayLastTransactions(account) {
    const listEl = document.getElementById('last-transactions-list');
    if (!listEl) return;

    listEl.innerHTML = ''; 

    const transactions = account.transactions.sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')) : new Date(b.date);
        const dateB = typeof b.date === 'string' ? new Date(b.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')) : new Date(b.date);
        return dateB - dateA;
    }).slice(0, 3); 

    if (transactions.length === 0) {
        listEl.innerHTML = '<li class="no-transactions">Nenhuma transação recente.</li>';
        return;
    }

    transactions.forEach(t => {
        const li = document.createElement('li');
        const typeClass = t.type === 'credit' ? 'credit' : 'debit';
        const iconClass = t.type === 'credit' ? 'fa-arrow-up' : 'fa-arrow-down';
        const amountClass = t.type === 'credit' ? 'credit' : 'debit';
        
        const formattedDate = (typeof t.date === 'string') 
            ? t.date.split(' ')[0] 
            : new Date(t.date).toLocaleDateString('pt-BR');
        
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="transaction-icon"><i class="fas ${iconClass}"></i></div>
            <div class="transaction-details">
                <span class="description">${t.description}</span>
                <span class="date">${formattedDate}</span>
            </div>
            <span class="amount ${amountClass}">
                ${t.type === 'debit' ? '-' : '+'} ${formatCurrency(t.amount).replace('R$', '')}
            </span>
        `;
        listEl.appendChild(li);
    });

    const viewAllLi = document.createElement('li');
    viewAllLi.className = 'view-all-link-item';
    viewAllLi.innerHTML = `<a href="extrato.html">Ver todo o Extrato</a>`;
    listEl.appendChild(viewAllLi);
}


function loadRecipients(currentAccount) {
    const bankData = loadBankData();
    const recipientSelect = document.getElementById('recipient-select');

    if (!recipientSelect) return; 

    recipientSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um destinatário';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    recipientSelect.appendChild(defaultOption);

    for (const key in bankData.accounts) {
        const account = bankData.accounts[key];
        const accountKey = account.agency + '-' + account.account;
        const currentAccountKey = currentAccount.agencia + '-' + currentAccount.account;
        
        if (accountKey !== currentAccountKey) { 
            const option = document.createElement('option');
            option.value = key; 
            option.textContent = `${account.owner} (Ag: ${account.agency} - Cnt: ${account.account.slice(-4)})`;
            recipientSelect.appendChild(option);
        }
    }
}

// FUNÇÃO DE EXTRATO COMPLETO (Inclui filtros)
function renderFullExtrato(account, filters = {}) {
    const listEl = document.getElementById('full-extrato-list');
    const summaryEl = document.getElementById('extrato-summary');
    if (!listEl || !summaryEl) return;

    listEl.innerHTML = '';
    
    let transactions = account.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    let totalDebit = 0;
    let totalCredit = 0;
    
    const filteredTransactions = transactions.filter(t => {
        const typeMatch = filters.type === 'all' || !filters.type || t.type === filters.type;
        return typeMatch;
    });


    if (filteredTransactions.length === 0) {
        listEl.innerHTML = '<li class="no-transactions">Nenhuma transação encontrada com os filtros aplicados.</li>';
        summaryEl.textContent = 'Nenhuma transação no período.';
        return;
    }
    
    filteredTransactions.forEach(t => {
        const typeClass = t.type === 'credit' ? 'credit' : 'debit';
        const amountClass = t.type === 'credit' ? 'credit' : 'debit';
        const formattedDate = (typeof t.date === 'string') 
            ? t.date.split(' ')[0] 
            : new Date(t.date).toLocaleDateString('pt-BR');
            
        const li = document.createElement('li');
        li.className = 'transaction-item extrato-full-item';

        li.innerHTML = `
            <div class="transaction-icon"><i class="fas ${t.type === 'credit' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></div>
            <div class="transaction-details-extrato">
                <span class="description">${t.description}</span>
                <span class="date">${formattedDate}</span>
            </div>
            <span class="amount ${amountClass}">
                ${t.type === 'debit' ? '-' : '+'} ${formatCurrency(t.amount).replace('R$', '')}
            </span>
        `;
        listEl.appendChild(li);
        
        if (t.type === 'debit') {
            totalDebit += t.amount;
        } else {
            totalCredit += t.amount;
        }
    });

    summaryEl.textContent = `Total de Despesas: ${formatCurrency(totalDebit)} | Total de Receitas: ${formatCurrency(totalCredit)}`;
}


// ----------------------------------------------------------------------
// 8. INICIALIZAÇÃO DE PÁGINA
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const currentAccount = getCurrentAccount();
    
    const isContaPage = document.body.classList.contains('page-conta');
    const isTransferPage = document.body.classList.contains('page-transferencia');
    const isExtratoPage = document.body.classList.contains('page-extrato'); 
    const isEmprestimoPage = document.body.classList.contains('page-emprestimo');
    const isCartoesPage = document.body.classList.contains('page-cartoes');
    const isSolicitacaoPage = document.body.classList.contains('page-solicitacao');

    if (!currentAccount && (isContaPage || isTransferPage || isExtratoPage || isEmprestimoPage || isCartoesPage || isSolicitacaoPage)) {
        window.location.href = 'login.html';
        return;
    }

    if (currentAccount) {
        // Lógica para conta.html (Dashboard)
        if (isContaPage) {
            const greetingEl = document.getElementById('user-greeting');
            const accountInfoEl = document.querySelector('.main-header p');
            
            if (greetingEl) {
                const firstName = currentAccount.owner.split(' ')[0];
                greetingEl.textContent = `Olá, ${firstName} 👋`;
            }
            
            if (accountInfoEl) {
                const formattedAccount = currentAccount.account.toString().slice(0, 5) + '-' + currentAccount.account.toString().slice(5);
                accountInfoEl.textContent = `Agência: ${currentAccount.agencia} | Conta: ${formattedAccount}`;
            }
            
            displayBalance(currentAccount);
            displayLastTransactions(currentAccount);
        }

        // Lógica para transferir.html
        if (isTransferPage) {
            loadRecipients(currentAccount);
            
            const transferForm = document.getElementById('transfer-form');
            if (transferForm) {
                transferForm.addEventListener('submit', transferHandler); 
            }
        }
        
        // Lógica para extrato.html
        if (isExtratoPage) {
            const accountInfoEl = document.querySelector('.main-header p');
            const formattedAccount = currentAccount.account.toString().slice(0, 5) + '-' + currentAccount.account.toString().slice(5);
            
            if (accountInfoEl) {
                accountInfoEl.textContent = `Agência: ${currentAccount.agencia} | Conta: ${formattedAccount}`;
            }

            const applyButton = document.getElementById('apply-filters');
            if (applyButton) {
                applyButton.addEventListener('click', () => {
                    const typeFilter = document.getElementById('filter-type').value;
                    renderFullExtrato(currentAccount, { type: typeFilter });
                });
            }
            renderFullExtrato(currentAccount, { type: 'all' });
        }
        
        // Lógica para emprestimos.html (Simulação)
        if (isEmprestimoPage) {
            const valorInput = document.getElementById('valor');
            const parcelasSelect = document.getElementById('parcelas');
            const loanSimulator = document.getElementById('loan-simulator');

            // Limpa o formulário e esconde os resultados ao entrar na página (UX)
            if (loanSimulator) {
                 loanSimulator.reset();
                 const resultsArea = document.getElementById('loan-results');
                 if (resultsArea) resultsArea.classList.add('hidden');
            }
            
            if (valorInput && parcelasSelect) {
                 if (!valorInput.value || !parcelasSelect.value) {
                     valorInput.value = 5000;
                     parcelasSelect.value = 12;
                 }
                 // Anexa listeners para mudança de input (CORREÇÃO DE AUTO-SIMULAÇÃO)
                 if (valorInput) valorInput.addEventListener('input', simulateLoan);
                 if (parcelasSelect) parcelasSelect.addEventListener('change', simulateLoan);

                 // Adiciona o listener de SUBMIT para o botão Simular
                 if (loanSimulator) {
                     loanSimulator.addEventListener('submit', function(e) {
                         e.preventDefault();
                         simulateLoan();
                     });
                 }
                 
                 simulateLoan(); // Simula na abertura da página
            }
        }
        
        // Lógica para cartoes.html (Ativação de Botões)
        if (isCartoesPage) {
            
            // 1. Preenchimento do Nome do Titular
            const nomeCompleto = currentAccount.owner;
            const nomeTitularElements = document.querySelectorAll('.card-holder');
            nomeTitularElements.forEach(el => {
                 el.textContent = nomeCompleto.toUpperCase();
            });
            
            // 2. Inicialização do estado Oculto do Cartão Virtual
            const numFisicoEl = document.getElementById('num-fisico');
            const numVirtualEl = document.getElementById('num-virtual');
            const cvvVirtualEl = document.getElementById('cvv-virtual');
            const validadeVirtualEl = document.getElementById('validade-virtual');
            const exibirDadosVirtualBtn = document.getElementById('exibir-dados');
            const toggleFisicoDataBtn = document.getElementById('toggle-fisico-data');
            
            // Inicializa Físico (Estado Oculto)
            if (numFisicoEl && currentAccount.cardData) {
                 const lastFourFisico = currentAccount.cardData.physicalNum.slice(-4);
                 numFisicoEl.textContent = `•••• •••• •••• ${lastFourFisico}`;
                 
                 if (toggleFisicoDataBtn) {
                     toggleFisicoDataBtn.innerHTML = '<i class="fas fa-eye"></i> Exibir Dados';
                 }
            }
            
            // Inicializa Virtual (Estado Oculto)
            if (numVirtualEl && cvvVirtualEl && validadeVirtualEl && currentAccount.cardData) {
                 const lastFourVirtual = currentAccount.cardData.virtualNum.slice(-4);
                 numVirtualEl.textContent = `•••• •••• •••• ${lastFourVirtual}`;
                 cvvVirtualEl.textContent = '***'; // CVV oculto
                 
                 if (exibirDadosVirtualBtn) {
                     exibirDadosVirtualBtn.innerHTML = '<i class="fas fa-eye"></i> Exibir Dados';
                 }
            }


            // 3. Anexo dos Listeners nos Botões
            
            // Botão Físico: Bloquear/Desbloquear
            const toggleFisicoBtn = document.getElementById('toggle-fisico');
            if (toggleFisicoBtn) {
                toggleFisicoBtn.removeEventListener('click', () => toggleCardLock(true)); 
                toggleFisicoBtn.addEventListener('click', () => toggleCardLock(true)); // Bloqueio
            }
            
            // Botão Virtual: Gerar Novo Cartão
            const regenerateVirtualBtn = document.getElementById('regenerate-virtual');
            if (regenerateVirtualBtn) {
                regenerateVirtualBtn.removeEventListener('click', generateNewVirtualCard); 
                regenerateVirtualBtn.addEventListener('click', generateNewVirtualCard); // Gerar CVV
            }
            
            // Botão Físico: Exibir Dados (ID 'toggle-fisico-data')
            if (toggleFisicoDataBtn) {
                toggleFisicoDataBtn.removeEventListener('click', () => toggleCardData(true));
                toggleFisicoDataBtn.addEventListener('click', () => toggleCardData(true)); // True = Físico
            }
            
            // Botão Virtual: Exibir Dados (ID 'exibir-dados')
            if (exibirDadosVirtualBtn) {
                exibirDadosVirtualBtn.removeEventListener('click', () => toggleCardData(false));
                exibirDadosVirtualBtn.addEventListener('click', () => toggleCardData(false)); // False = Virtual
            }
            
            // Botão: Configurações (Ações que sobram - Simulação)
            const configBtns = document.querySelectorAll('.card-actions button:not(#toggle-fisico):not(#exibir-dados):not(#regenerate-virtual):not(#toggle-fisico-data)');
            configBtns.forEach(btn => {
                btn.removeEventListener('click', handleConfiguration);
                btn.addEventListener('click', handleConfiguration);
            });
        }
        
        // Lógica para solicitar-cartao.html (Solicitação de Cartão)
        if (isSolicitacaoPage) {
            const solicitacaoForm = document.getElementById('solicitacao-form');
            
            if (solicitacaoForm) {
                solicitacaoForm.addEventListener('submit', handleCardRequest);
            }
        }
    }
});