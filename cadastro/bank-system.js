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
            transactions: []
        },
        "0001-987654": {
            owner: "Diogo Melo Ferraz",
            agency: "0001",
            account: "987654",
            balance: 350.50,
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
        // CORREÇÃO DA AGÊNCIA: Garante que a agência e conta sejam strings, usando 0001 como fallback
        const agencia = loggedUser.agencia ? loggedUser.agencia.toString().padStart(4, '0') : "0001";
        const conta = loggedUser.conta ? loggedUser.conta.toString().padStart(6, '0') : loggedUser.account.toString().padStart(6, '0');

        const accountKey = `${agencia}-${conta}`;
        
        if (!bankData.accounts[accountKey]) {
             bankData.accounts[accountKey] = {
                 owner: loggedUser.nome,
                 agency: agencia,
                 account: conta,
                 balance: 0.00, 
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
// 4. FUNÇÕES DE RENDERIZAÇÃO E EXTRATO COMPLETO (Corrigidas)
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
        const dateA = typeof a.date === 'string' ? new Date(a.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')) : new Date(a.date);
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
        // Lógica para o filtro de mês/período seria adicionada aqui, se necessário.
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
// 7. INICIALIZAÇÃO DE PÁGINA
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const currentAccount = getCurrentAccount();
    
    const isContaPage = document.body.classList.contains('page-conta');
    const isTransferPage = document.body.classList.contains('page-transferencia');
    const isExtratoPage = document.body.classList.contains('page-extrato'); 

    if (!currentAccount && (isContaPage || isTransferPage || isExtratoPage)) {
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
            const accountInfoEl = document.querySelector('#account-info');
            const formattedAccount = currentAccount.account.toString().slice(0, 5) + '-' + currentAccount.account.toString().slice(5);
            
            // Corrige o header na página Extrato
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
            // Inicializa o extrato completo
            renderFullExtrato(currentAccount, { type: 'all' });
        }
    }
});