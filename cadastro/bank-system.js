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
            loanLimit: 15000.00, // Limite de Brendo
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
            loanLimit: 7500.00, // Limite da Maria
            transactions: []
        },
        "0001-987654": {
            owner: "Diogo Melo Ferraz",
            agency: "0001",
            account: "987654",
            balance: 350.50,
            loanLimit: 3000.00, // Limite do Diogo
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
                 loanLimit: 2000.00, // Limite padrão para novos cadastros
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
// 3. FUNÇÃO DE TRANSFERÊNCIA (LÓGICA PIX)
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
    
    // Realiza o Débito e Crédito (Simulação)
    currentUser.balance = parseFloat((currentUser.balance - amount).toFixed(2));
    recipientAccount.balance = parseFloat((recipientAccount.balance + amount).toFixed(2));

    const date = new Date();
    const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const transactionId = Date.now();
    
    const senderName = currentUser.owner.split(' ')[0];
    const recipientName = recipientAccount.owner.split(' ')[0];

    // Adiciona ao extrato do REMETENTE (Débito)
    currentUser.transactions.push({
        id: transactionId,
        type: 'debit',
        description: `Pix para ${recipientName} - ${description}`,
        amount: amount,
        date: dateStr
    });

    // Adiciona ao extrato do DESTINATÁRIO (Crédito)
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
// 4. LÓGICA DE EMPRÉSTIMO (Cálculo e Contratação) - CORREÇÃO DE LIMITE
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

    // --- 1. CHECAGEM CRÍTICA DE LIMITE ---
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

    // Anexa o listener de clique de forma simples e robusta
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

    // Validação de limite (redundante, mas importante)
    if (valorContratado > currentUser.loanLimit) {
        alert(`Não é possível contratar: Valor excede seu limite de ${formatCurrency(currentUser.loanLimit)}.`);
        return;
    }
    
    // 1. Crédito do valor do empréstimo na conta
    currentUser.balance += valorContratado;
    currentUser.balance = parseFloat(currentUser.balance.toFixed(2)); 
    
    // 2. CORREÇÃO CRÍTICA: Abate o limite disponível
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
// 5. FUNÇÕES DE RENDERIZAÇÃO
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
// 6. INICIALIZAÇÃO DE PÁGINA
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const currentAccount = getCurrentAccount();
    
    const isContaPage = document.body.classList.contains('page-conta');
    const isTransferPage = document.body.classList.contains('page-transferencia');
    const isExtratoPage = document.body.classList.contains('page-extrato'); 
    const isEmprestimoPage = document.body.classList.contains('page-emprestimo');

    if (!currentAccount && (isContaPage || isTransferPage || isExtratoPage || isEmprestimoPage)) {
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
                 // A simulação deve ser ativada APENAS pelo submit.
                 
                 // Adiciona o listener para o submit do formulário de simulação
                 if (loanSimulator) {
                     loanSimulator.addEventListener('submit', function(e) {
                         e.preventDefault();
                         simulateLoan();
                     });
                 }
                 
                 // Simula na abertura da página (com os valores padrão)
                 simulateLoan(); 
            }
        }
    }
});