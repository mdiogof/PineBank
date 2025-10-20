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
                virtualNum: '4567 • 8901 • 2345 • 5678',
                virtualCvv: '987',
                validity: '01/29'
            },
            investments: {
                totalValue: 12540.00,
                monthlyReturn: 112.86,
                products: [
                    { name: "CDB Pineapple 110% CDI", type: "cdb", value: 8000.00, rate: 1.10 },
                    { name: "Tesouro Selic 2027", type: "tesouro", value: 4540.00, rate: 0.05 },
                ]
            },
            goals: [
                { id: 1, name: "Viagem para a Disney", target: 15000.00, saved: 3500.00, dateCreated: "01/09/2025" },
                { id: 2, name: "Reserva de Emergência", target: 5000.00, saved: 500.00, dateCreated: "05/10/2025" },
                { id: 3, name: "Meta Zerada", target: 1000.00, saved: 0.00, dateCreated: "10/10/2025" } 
            ],
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
            investments: null,
            goals: [], 
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
            investments: null,
            goals: [],
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
        let savedData = JSON.parse(data);
        
        // Garante que o usuário teste tenha a estrutura completa 
        if (!savedData.accounts["0001-123456"].investments) {
             savedData.accounts["0001-123456"].investments = initialBankData.accounts["0001-123456"].investments;
        }
        if (!savedData.accounts["0001-123456"].goals) {
             savedData.accounts["0001-123456"].goals = initialBankData.accounts["0001-123456"].goals;
        }
        saveBankData(savedData);
        return savedData;
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
                 cardData: initialBankData.accounts["0001-123456"].cardData,
                 investments: null,
                 goals: [], 
                 transactions: []
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
        statusEl.textContent = 'BLOQUEADO';
        statusEl.classList.remove('status-active');
        statusEl.classList.add('status-locked');
        buttonEl.innerHTML = '<i class="fas fa-unlock"></i> Desbloquear Temporariamente';
        buttonEl.classList.remove('toggle-lock');
        buttonEl.classList.add('action-danger');
        if (cardEl) cardEl.classList.add('locked-card');
        alert("Cartão bloqueado com sucesso. Transações serão negadas.");
        
    } else {
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
    
    if (!numVirtualEl || !cvvEl) return;

    let bankData = loadBankData();
    let currentUser = getCurrentAccount();
    const currentAccountKey = currentUser.agency + '-' + currentUser.account;

    const newLastFour = generateRandomCardSegment();
    const fullNewNumber = `${generateRandomCardSegment()} • ${generateRandomCardSegment()} • ${generateRandomCardSegment()} • ${newLastFour}`; 
    const newCvv = generateRandomCvv();

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const newYear = (nextMonth.getFullYear() + 4).toString().slice(-2);
    const newValidity = `${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}/${newYear}`;

    currentUser.cardData.virtualNum = fullNewNumber; 
    currentUser.cardData.virtualCvv = newCvv.toString();
    currentUser.cardData.validity = newValidity;
    bankData.accounts[currentAccountKey] = currentUser;
    saveBankData(bankData);

    numVirtualEl.textContent = `•••• •••• •••• ${newLastFour}`; 
    cvvEl.textContent = '***'; 
    
    const validadeEl = document.getElementById('validade-virtual');
    if(validadeEl) validadeEl.textContent = newValidity;
    
    alert(`Novo Cartão Virtual gerado! Validade: ${newValidity}. O antigo foi invalidado.`);
}

function toggleCardData(isPhysical) {
    let numEl = isPhysical ? document.getElementById('num-fisico') : document.getElementById('num-virtual');
    let cvvEl = isPhysical ? null : document.getElementById('cvv-virtual');
    let button = isPhysical ? document.getElementById('toggle-fisico-data') : document.getElementById('exibir-dados');
    
    let currentUser = getCurrentAccount(); 
    if (!currentUser || !numEl || !button || !currentUser.cardData) return;
    
    const isHidden = numEl.textContent.startsWith('•');
    
    const fullNum = isPhysical ? currentUser.cardData.physicalNum : currentUser.cardData.virtualNum;
    const currentCvv = currentUser.cardData.virtualCvv;
    const lastFour = fullNum.slice(-4);
    
    if (isHidden) {
        numEl.textContent = fullNum;
        if (cvvEl) cvvEl.textContent = currentCvv;
        button.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Dados';
    } else {
        numEl.textContent = `•••• •••• •••• ${lastFour}`;
        if (cvvEl) cvvEl.textContent = '***'; 
        button.innerHTML = '<i class="fas fa-eye"></i> Exibir Dados';
    }
}

function handleConfiguration() {
    alert("Redirecionando para a página de Configurações de Cartão (Simulação).");
}


// ----------------------------------------------------------------------
// 4. LÓGICA DE SOLICITAÇÃO DE CARTÃO (2ª VIA) 
// ----------------------------------------------------------------------

function handleCardRequest(e) {
    e.preventDefault(); 
    
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
    
    if (motivo.value === 'roubo') {
        alert("Cartão antigo BLOQUEADO IMEDIATAMENTE por segurança. Um novo será enviado.");
    }
    
    let bankData = loadBankData();
    let currentUser = getCurrentAccount();
    const currentAccountKey = currentUser.agency + '-' + currentUser.account;
    
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

    currentUser.transactions.push({
        id: Date.now() + 1,
        type: 'debit', 
        description: `Envio 2ª Via Cartão - Chegada em 10 dias`,
        amount: 0.00,
        date: new Date().toLocaleDateString('pt-BR'),
        isFuture: true
    });
    
    bankData.accounts[currentAccountKey] = currentUser;
    saveBankData(bankData);
    
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
    const loggedUserInfo = JSON.parse(localStorage.getItem('usuarioLogado')); 
    const currentAccountKey = loggedUserInfo.agencia + '-' + loggedUserInfo.conta;
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
    
    if (V > limit) {
        if (V > limit) valorEl.value = limit; 
        resultsArea.classList.add('hidden');
        return;
    }

    if (isNaN(V) || V < 1000 || isNaN(N) || N < 1 || V > 20000) {
        resultsArea.classList.add('hidden');
        return;
    }

    const iofFixo = V * LOAN_CONFIG.IOF_FIXED_RATE;
    const iofDiario = V * LOAN_CONFIG.IOF_DAILY_RATE * (N * 30);
    const iofTotal = iofFixo + iofDiario;
    const taxaJurosMensal = LOAN_CONFIG.INTEREST_RATE;
    const parcela = calculatePMT(taxaJurosMensal, N, V); 
    const valorTotalPagar = parcela * N;
    const custoTotalEfetivo = valorTotalPagar - V + iofTotal;
    const cetAnual = Math.pow(1 + (custoTotalEfetivo / V), 12 / N) - 1; 
    const cetMensalPercentual = (cetAnual / 12) * 100;
    
    document.getElementById('res-valor-solicitado').textContent = formatCurrency(V);
    document.getElementById('res-juros').textContent = (taxaJurosMensal * 100).toFixed(2) + '% a.m.';
    document.getElementById('res-iof').textContent = formatCurrency(iofTotal);
    document.getElementById('res-cet').textContent = cetMensalPercentual.toFixed(2) + '% a.m.';
    document.getElementById('res-parcela').textContent = formatCurrency(parcela);
    document.getElementById('res-total-pagar').textContent = formatCurrency(valorTotalPagar);

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

    if (valorContratado > currentUser.loanLimit) {
        alert(`Não é possível contratar: Valor excede seu limite de ${formatCurrency(currentUser.loanLimit)}.`);
        return;
    }
    
    currentUser.balance += valorContratado;
    currentUser.balance = parseFloat(currentUser.balance.toFixed(2)); 
    
    currentUser.loanLimit = parseFloat((currentUser.loanLimit - valorContratado).toFixed(2));
    if (currentUser.loanLimit < 0) currentUser.loanLimit = 0; 

    currentUser.transactions.push({
        id: Date.now(),
        type: 'credit',
        description: `Empréstimo Contratado`,
        amount: valorContratado,
        date: new Date().toLocaleDateString('pt-BR')
    });
    
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

    allAccounts[currentAccountKey] = currentUser;
    saveBankData({ accounts: allAccounts, currentUserKey: currentAccountKey });

    setTimeout(() => {
        alert(`Empréstimo de ${formatCurrency(valorContratado)} contratado! ${numParcelas} parcelas de ${formatCurrency(valorParcela)} agendadas.`);
        window.location.href = 'conta.html';
    }, 100);
}


// ----------------------------------------------------------------------
// 7. FUNÇÕES DE RENDERIZAÇÃO E UTILS
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

function loadRecipients(currentAccount) { /* ... implementado ... */ }

function renderFullExtrato(account, filters = {}) {
    const listEl = document.getElementById('full-extrato-list');
    const summaryEl = document.getElementById('extrato-summary');
    if (!listEl || !summaryEl) return;

    listEl.innerHTML = '';
    
    let transactions = account.transactions.sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')) : new Date(b.date);
        const dateB = typeof b.date === 'string' ? new Date(b.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')) : new Date(b.date);
        return dateB - dateA;
    });

    let totalDebit = 0;
    let totalCredit = 0;
    
    // --- LÓGICA DE FILTRAGEM ---
    const filteredTransactions = transactions.filter(t => {
        // 1. Filtro por Tipo (credit/debit/all)
        const typeMatch = filters.type === 'all' || !filters.type || t.type === filters.type;
        
        // 2. Filtro por Mês e Ano
        let dateMatch = true;
        if (filters.month) {
            const transactionDate = new Date(t.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
            const filterDate = new Date(filters.month); 

            dateMatch = (
                transactionDate.getFullYear() === filterDate.getFullYear() &&
                transactionDate.getMonth() === filterDate.getMonth()
            );
        }
        
        return typeMatch && dateMatch;
    });
    // --- FIM DA LÓGICA DE FILTRAGEM ---


    if (filteredTransactions.length === 0) {
        listEl.innerHTML = '<li class="no-transactions">Nenhuma transação encontrada com os filtros aplicados.</li>';
        summaryEl.textContent = 'Total de Despesas: R$ 0,00 | Total de Receitas: R$ 0,00';
        return;
    }
    
    filteredTransactions.forEach(t => {
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

function renderInvestmentData(account) { /* ... implementado ... */ }


// FUNÇÕES DO COFRINHO
function renderCofrinho(account) {
    const totalCofrinhoEl = document.getElementById('total-cofrinho');
    const goalListEl = document.getElementById('goal-list');
    const emptyStateEl = document.getElementById('empty-state');
    const nextGoalInfoEl = document.getElementById('next-goal-info');
    
    if (!totalCofrinhoEl || !goalListEl) return;

    const allGoals = account.goals || [];
    
    // CORREÇÃO: Filtra metas que não têm valor guardado (saved > 0)
    const activeGoals = allGoals.filter(goal => goal.saved > 0);
    
    const totalSaved = activeGoals.reduce((sum, goal) => sum + goal.saved, 0);
    
    totalCofrinhoEl.textContent = formatCurrency(totalSaved);

    goalListEl.innerHTML = ''; 

    if (activeGoals.length === 0) {
        if (emptyStateEl) emptyStateEl.classList.remove('hidden');
        if (nextGoalInfoEl) nextGoalInfoEl.textContent = 'Nenhuma meta ativa.';
        return;
    }
    
    if (emptyStateEl) emptyStateEl.classList.add('hidden');

    const closestGoal = activeGoals.map(g => ({
        ...g,
        progress: g.saved / g.target
    })).sort((a, b) => b.progress - a.progress)[0];

    if (nextGoalInfoEl && closestGoal) {
        const remaining = closestGoal.target - closestGoal.saved;
        nextGoalInfoEl.textContent = `Faltam ${formatCurrency(remaining)} para atingir: ${closestGoal.name}`;
    }


    activeGoals.forEach(goal => {
        const progress = (goal.saved / goal.target) * 100;
        const progressClamped = Math.min(progress, 100).toFixed(2);
        
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">
                    <h3>${goal.name}</h3>
                </div>
                <p>Meta: ${formatCurrency(goal.target)}</p>
            </div>
            
            <div class="goal-progress-bar">
                <div class="progress-fill" style="width: ${progressClamped}%;"></div>
            </div>
            
            <div class="goal-info">
                <span>Guardado: ${formatCurrency(goal.saved)}</span>
                <span class="progress-percent">${progressClamped}%</span>
            </div>
        `;
        goalListEl.appendChild(goalCard);
    });
}

function createNewGoal(e) {
    e.preventDefault(); 
    
    const goalNameEl = document.getElementById('goal-name');
    const goalTargetEl = document.getElementById('goal-target');
    const initialDepositEl = document.getElementById('initial-deposit');

    const name = goalNameEl.value.trim();
    const target = parseFloat(goalTargetEl.value);
    
    // CORREÇÃO: Trata a vírgula para depósito inicial
    const depositInput = initialDepositEl.value.replace(',', '.');
    const initialDeposit = parseFloat(depositInput) || 0; 
    
    if (!name || isNaN(target) || target < 100) {
        alert("Preencha o nome da meta e o valor alvo corretamente (mínimo R$100).");
        return;
    }

    let bankData = loadBankData();
    let currentUser = getCurrentAccount();
    const currentAccountKey = currentUser.agency + '-' + currentUser.account;
    
    if (initialDeposit > currentUser.balance) {
        alert(`Saldo insuficiente para depósito inicial. Saldo: ${formatCurrency(currentUser.balance)}`);
        return;
    }

    if (initialDeposit > 0) {
        currentUser.balance = parseFloat((currentUser.balance - initialDeposit).toFixed(2));
        
        currentUser.transactions.push({
            id: Date.now(),
            type: 'debit',
            description: `Depósito inicial: Cofrinho ${name}`,
            amount: initialDeposit,
            date: new Date().toLocaleDateString('pt-BR')
        });
    }

    const newGoal = {
        id: Date.now(),
        name: name,
        target: target,
        saved: initialDeposit,
        dateCreated: new Date().toLocaleDateString('pt-BR')
    };

    if (!currentUser.goals) currentUser.goals = [];
    currentUser.goals.push(newGoal);

    bankData.accounts[currentAccountKey] = currentUser;
    saveBankData(bankData);
    
    document.getElementById('new-goal-form-area').classList.add('hidden');
    
    alert(`Meta "${name}" criada com sucesso!`);
    window.location.reload(); 
}

// FUNÇÕES DO MODAL DE MOVIMENTAÇÃO
function setupMovimentarModal(type) {
    const modal = document.getElementById('movimentar-modal');
    const modalTitle = document.getElementById('modal-title');
    const resgatarBtn = document.getElementById('resgatar-btn');
    const aportarBtn = document.getElementById('aportar-btn');
    const form = document.getElementById('movimentar-form');
    const infoSaldo = document.getElementById('info-saldo');
    const selectGoal = document.getElementById('select-goal');
    
    if (!modal || !form) return;

    form.removeEventListener('submit', handleAporteResgate); 
    
    if (type === 'aportar') {
        modalTitle.textContent = 'Aportar em Meta';
        aportarBtn.style.display = 'block';
        resgatarBtn.style.display = 'none';
        form.dataset.movimentationType = 'aportar';
        
    } else if (type === 'resgatar') {
        modalTitle.textContent = 'Resgatar de Meta';
        aportarBtn.style.display = 'none';
        resgatarBtn.style.display = 'block';
        form.dataset.movimentationType = 'resgatar';
    }
    
    const currentUser = getCurrentAccount();
    infoSaldo.textContent = `Seu saldo em conta: ${formatCurrency(currentUser.balance)}`;
    
    selectGoal.innerHTML = '<option value="">Selecione...</option>';
    if (currentUser.goals && currentUser.goals.length > 0) {
        // Mostra apenas metas com saldo > 0 para Resgate
        const goalsToDisplay = type === 'resgatar' ? currentUser.goals.filter(g => g.saved > 0) : currentUser.goals;

        goalsToDisplay.forEach(goal => {
            const option = document.createElement('option');
            option.value = goal.id;
            option.textContent = `${goal.name} (Guardado: ${formatCurrency(goal.saved)})`;
            selectGoal.appendChild(option);
        });
        
        if (goalsToDisplay.length === 0 && type === 'resgatar') {
            selectGoal.innerHTML = '<option value="">Nenhuma meta para resgate.</option>';
            // Desabilita o botão de resgate se não houver metas com saldo
            resgatarBtn.disabled = true;
        } else {
             resgatarBtn.disabled = false;
        }
    }

    form.addEventListener('submit', handleAporteResgate); 
    
    modal.classList.remove('hidden');
}


function handleAporteResgate(e) {
    e.preventDefault();

    const form = e.target;
    const type = form.dataset.movimentationType;
    const goalId = parseInt(document.getElementById('select-goal').value);
    
    // CORREÇÃO CRÍTICA: Pega o valor e substitui vírgula por ponto antes de converter
    const amountInput = document.getElementById('movimentar-value').value;
    const amount = parseFloat(amountInput.replace(',', '.')); 
    
    if (!goalId || isNaN(amount) || amount <= 0) {
        alert("Selecione uma meta e insira um valor válido.");
        return;
    }
    
    let bankData = loadBankData();
    let currentUser = getCurrentAccount();
    const currentAccountKey = currentUser.agency + '-' + currentUser.account;
    const goalIndex = currentUser.goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
        alert("Meta não encontrada.");
        return;
    }
    
    let goal = currentUser.goals[goalIndex];
    
    if (type === 'aportar') {
        if (amount > currentUser.balance) {
            alert(`Saldo insuficiente na conta. Disponível: ${formatCurrency(currentUser.balance)}`);
            return;
        }
        
        currentUser.balance -= amount;
        goal.saved += amount;
        
        currentUser.transactions.push({
            id: Date.now(), type: 'debit', amount: amount,
            description: `Aporte no Cofrinho: ${goal.name}`,
            date: new Date().toLocaleDateString('pt-BR')
        });
        
        alert(`Aporte de ${formatCurrency(amount)} realizado com sucesso em ${goal.name}!`);

    } else if (type === 'resgatar') {
        if (amount > goal.saved) {
            alert(`Valor de resgate excede o valor guardado na meta. Guardado: ${formatCurrency(goal.saved)}`);
            return;
        }
        
        currentUser.balance += amount;
        goal.saved -= amount;
        
        currentUser.transactions.push({
            id: Date.now(), type: 'credit', amount: amount,
            description: `Resgate do Cofrinho: ${goal.name}`,
            date: new Date().toLocaleDateString('pt-BR')
        });
        
        alert(`Resgate de ${formatCurrency(amount)} realizado com sucesso para a conta corrente!`);
    }

    currentUser.balance = parseFloat(currentUser.balance.toFixed(2));
    bankData.accounts[currentAccountKey] = currentUser;
    saveBankData(bankData);
    
    document.getElementById('movimentar-modal').classList.add('hidden');
    window.location.reload(); 
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
    const isInvestimentosPage = document.body.classList.contains('page-investimentos');
    const isCofrinhoPage = document.body.classList.contains('page-cofrinho');
    const isPagarPage = document.body.classList.contains('page-pagar');

    if (!currentAccount && (isContaPage || isTransferPage || isExtratoPage || isEmprestimoPage || isCartoesPage || isSolicitacaoPage || isInvestimentosPage || isCofrinhoPage || isDepositarPage || isPagarPage)) {
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
                 accountInfoEl.textContent = `Agência: ${currentAccount.agency} | Conta: ${formattedAccount}`;
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
                accountInfoEl.textContent = `Agência: ${currentAccount.agency} | Conta: ${formattedAccount}`;
            }

            const applyButton = document.getElementById('apply-filters');
            const filterType = document.getElementById('filter-type');
            const filterMonth = document.getElementById('filter-month'); 

            const applyCurrentFilters = () => {
                const filters = {
                    type: filterType.value,
                    month: filterMonth.value
                };
                renderFullExtrato(currentAccount, filters);
            };

            if (applyButton) {
                applyButton.addEventListener('click', applyCurrentFilters);
            }
            
            applyCurrentFilters(); 
        }
        
        // Lógica para emprestimos.html (Simulação)
        if (isEmprestimoPage) { 
            const valorInput = document.getElementById('valor');
            const parcelasSelect = document.getElementById('parcelas');
            const loanSimulator = document.getElementById('loan-simulator');

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
                if (valorInput) valorInput.addEventListener('input', simulateLoan);
                if (parcelasSelect) parcelasSelect.addEventListener('change', simulateLoan);

                if (loanSimulator) {
                    loanSimulator.addEventListener('submit', function(e) {
                        e.preventDefault();
                        simulateLoan();
                    });
                }
                simulateLoan(); 
            }
        }
        
        // Lógica para cartoes.html (Ativação de Botões e Exibição)
        if (isCartoesPage) { 
             const nomeCompleto = currentAccount.owner;
             const nomeTitularElements = document.querySelectorAll('.card-holder');
             nomeTitularElements.forEach(el => {
                  el.textContent = nomeCompleto.toUpperCase();
             });
             
             const numFisicoEl = document.getElementById('num-fisico');
             const numVirtualEl = document.getElementById('num-virtual');
             const cvvVirtualEl = document.getElementById('cvv-virtual');
             const validadeVirtualEl = document.getElementById('validade-virtual');
             const exibirDadosVirtualBtn = document.getElementById('exibir-dados');
             const toggleFisicoDataBtn = document.getElementById('toggle-fisico-data');
             
             if (numFisicoEl && currentAccount.cardData) {
                  const lastFourFisico = currentAccount.cardData.physicalNum.slice(-4);
                  numFisicoEl.textContent = `•••• •••• •••• ${lastFourFisico}`;
                  if (toggleFisicoDataBtn) {
                      toggleFisicoDataBtn.innerHTML = '<i class="fas fa-eye"></i> Exibir Dados';
                  }
             }
             
             if (numVirtualEl && cvvVirtualEl && currentAccount.cardData) {
                  const lastFourVirtual = currentAccount.cardData.virtualNum.slice(-4);
                  numVirtualEl.textContent = `•••• •••• •••• ${lastFourVirtual}`;
                  cvvVirtualEl.textContent = '***'; 
                  if (exibirDadosVirtualBtn) {
                      exibirDadosVirtualBtn.innerHTML = '<i class="fas fa-eye"></i> Exibir Dados';
                  }
                  if(validadeVirtualEl) validadeVirtualEl.textContent = currentAccount.cardData.validity;
             }
 
             const toggleFisicoBtn = document.getElementById('toggle-fisico');
             if (toggleFisicoBtn) {
                 toggleFisicoBtn.addEventListener('click', () => toggleCardLock(true)); 
             }
             
             const regenerateVirtualBtn = document.getElementById('regenerate-virtual');
             if (regenerateVirtualBtn) {
                 regenerateVirtualBtn.addEventListener('click', generateNewVirtualCard); 
             }
             
             if (toggleFisicoDataBtn) {
                 toggleFisicoDataBtn.addEventListener('click', () => toggleCardData(true)); 
             }
             
             if (exibirDadosVirtualBtn) {
                 exibirDadosVirtualBtn.addEventListener('click', () => toggleCardData(false)); 
             }
             
             const configBtns = document.querySelectorAll('.card-actions button:not(#toggle-fisico):not(#exibir-dados):not(#regenerate-virtual):not(#toggle-fisico-data)');
             configBtns.forEach(btn => {
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
        
        // Lógica para investimentos.html
        if (isInvestimentosPage) { renderInvestmentData(currentAccount); }
        
        // Lógica para cofrinho.html
        if (isCofrinhoPage) {
            renderCofrinho(currentAccount);

            const btnNewGoal = document.getElementById('btn-new-goal');
            const btnCancelGoal = document.getElementById('btn-cancel-goal');
            const newGoalFormArea = document.getElementById('new-goal-form-area');
            const newGoalForm = document.getElementById('new-goal-form');

            if (btnNewGoal) {
                btnNewGoal.addEventListener('click', (e) => {
                    e.preventDefault();
                    newGoalFormArea.classList.remove('hidden');
                });
            }
            if (btnCancelGoal) {
                btnCancelGoal.addEventListener('click', () => {
                    newGoalFormArea.classList.add('hidden');
                });
            }
            if (newGoalForm) {
                newGoalForm.addEventListener('submit', createNewGoal);
            }
            
            // LISTENERS DO MODAL DE MOVIMENTAÇÃO
            const aportarBtnQuick = document.querySelector('.cofrinho-actions a:nth-child(2)'); 
            const resgatarBtnQuick = document.querySelector('.cofrinho-actions a:nth-child(3)');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const movimentarModal = document.getElementById('movimentar-modal');

            if (aportarBtnQuick) {
                aportarBtnQuick.addEventListener('click', (e) => {
                    e.preventDefault();
                    setupMovimentarModal('aportar');
                });
            }
            if (resgatarBtnQuick) {
                resgatarBtnQuick.addEventListener('click', (e) => {
                    e.preventDefault();
                    setupMovimentarModal('resgatar');
                });
            }
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    movimentarModal.classList.add('hidden');
                });
            }
        }
    }
});