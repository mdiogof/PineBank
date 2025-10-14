document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // Variáveis Globais e Funções Auxiliares
    // ----------------------------------------------------------------------
    
    let allBankData = JSON.parse(localStorage.getItem('bankData')) || {
        currentUserAccount: '0001-12345-6', // ID da conta logada
        accounts: {
            '0001-12345-6': { // Sua conta
                owner: 'Brendo Ryan Da Costa Manoel',
                agency: '0001',
                account: '12345-6',
                balance: 5750.22,
                transactions: [
                    { id: Date.now() + 1, type: 'debit', description: 'Amazon Marketplace', amount: 150.90, date: 'Ontem, 15:30' },
                    { id: Date.now() + 2, type: 'credit', description: 'Rendimento CDB Pineapple', amount: 45.12, date: '01 Outubro' },
                    { id: Date.now() + 3, type: 'debit', description: 'Restaurante Sabor Doce', amount: 68.00, date: '28 Setembro' }
                ]
            },
            '0001-78901-2': { // Conta da Maria/Mercado para simulação
                owner: 'Maria C. Silva',
                agency: '0001',
                account: '78901-2',
                balance: 1200.00,
                transactions: []
            }
        }
    };

    function saveBankData() {
        localStorage.setItem('bankData', JSON.stringify(allBankData));
    }

    function getCurrentAccount() {
        return allBankData.accounts[allBankData.currentUserAccount];
    }

    // Inicializa os dados se não existirem
    if (!localStorage.getItem('bankData')) {
        saveBankData();
    }

    // ----------------------------------------------------------------------
    // 1. Lógica para a Página de Login (Se este script for usado lá)
    // ----------------------------------------------------------------------
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const agencia = document.getElementById('agencia').value;
            const conta = document.getElementById('conta').value;
            const senha = document.getElementById('senha').value;

            // Dados de teste para Brendo Ryan
            const TEST_USER = {
                agencia: '0001',
                conta: '12345-6',
                senha: '123'
            };

            if (agencia === TEST_USER.agencia && conta === TEST_USER.conta && senha === TEST_USER.senha) {
                allBankData.currentUserAccount = `${agencia}-${conta}`; // Define qual conta está logada
                saveBankData();
                window.location.href = 'conta.html';
            } else {
                alert('Agência, Conta ou Senha incorretos. Use os dados de teste (Ag: 0001, Cnt: 12345-6, Senha: 123).');
            }
        });
    }

    // ----------------------------------------------------------------------
    // 2. Lógica para a Página da Conta (conta.html)
    // ----------------------------------------------------------------------
    const greetingElement = document.getElementById('user-greeting');
    const balanceElement = document.getElementById('current-balance');
    const toggleButton = document.getElementById('toggle-balance');
    const transactionListElement = document.querySelector('.transaction-list');
    const currentAccount = getCurrentAccount();

    if (currentAccount && greetingElement && balanceElement) {
        // Saudação Personalizada
        const nameParts = currentAccount.owner.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        greetingElement.textContent = `Olá, ${firstName} ${lastName} 👋`;

        // Exibir Saldo
        let isBalanceHidden = false; // Estado inicial do saldo
        const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

        function updateBalanceDisplay() {
            balanceElement.textContent = isBalanceHidden ? 'R$ ••••••' : formatCurrency(currentAccount.balance);
            toggleButton.querySelector('i').className = isBalanceHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
        }

        updateBalanceDisplay(); // Chama a primeira vez para exibir o saldo

        toggleButton.addEventListener('click', () => {
            isBalanceHidden = !isBalanceHidden;
            updateBalanceDisplay();
        });

        // Preencher Últimas Atividades
        if (transactionListElement) {
            transactionListElement.innerHTML = ''; // Limpa antes de preencher
            currentAccount.transactions.slice(-3).reverse().forEach(trans => { // Últimas 3 transações
                const typeClass = trans.type === 'debit' ? 'expense' : 'income';
                const iconClass = trans.type === 'debit' ? 'fa-shopping-cart' : 'fa-piggy-bank'; // Ícone genérico
                const transactionItem = document.createElement('div');
                transactionItem.className = 'transaction-item';
                transactionItem.innerHTML = `
                    <div class="icon-details">
                        <i class="fas ${iconClass} ${typeClass}"></i>
                        <div>
                            <h4>${trans.description}</h4>
                            <p>${trans.date}</p>
                        </div>
                    </div>
                    <span class="amount ${typeClass}">${trans.type === 'credit' ? '+' : '-'} R$ ${trans.amount.toFixed(2).replace('.', ',')}</span>
                `;
                transactionListElement.appendChild(transactionItem);
            });
            // Adiciona o link "Ver todo o Extrato"
            const viewAllLink = document.createElement('a');
            viewAllLink.href = '#'; // Link para a futura página de extrato completo
            viewAllLink.className = 'view-all-link';
            viewAllLink.textContent = 'Ver todo o Extrato';
            transactionListElement.appendChild(viewAllLink);
        }
    }

    // ----------------------------------------------------------------------
    // 3. Lógica para a Página de Transferência (transferir.html)
    // ----------------------------------------------------------------------
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        const recipientAccountSelect = document.getElementById('recipient-account');
        
        // Preencher opções de destinatário (excluindo a própria conta)
        for (const accountId in allBankData.accounts) {
            if (accountId !== allBankData.currentUserAccount) {
                const account = allBankData.accounts[accountId];
                const option = document.createElement('option');
                option.value = accountId;
                option.textContent = `${account.owner} (Ag: ${account.agency} / Cnt: ${account.account})`;
                recipientAccountSelect.appendChild(option);
            }
        }

        transferForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const senderAccount = getCurrentAccount();
            const recipientAccountId = recipientAccountSelect.value;
            const recipientAccount = allBankData.accounts[recipientAccountId];
            const amount = parseFloat(document.getElementById('transfer-amount').value);
            const description = document.getElementById('transfer-description').value;

            if (isNaN(amount) || amount <= 0) {
                alert('Por favor, insira um valor válido para a transferência.');
                return;
            }
            if (senderAccount.balance < amount) {
                alert('Saldo insuficiente para realizar esta transferência.');
                return;
            }

            // Realiza a transferência (simulada)
            senderAccount.balance -= amount;
            recipientAccount.balance += amount;

            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ', ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            senderAccount.transactions.unshift({ // Adiciona no início do array
                id: Date.now(),
                type: 'debit',
                description: `PIX para ${recipientAccount.owner}`,
                amount: amount,
                date: dateStr
            });

            recipientAccount.transactions.unshift({ // Adiciona no início do array
                id: Date.now() + 1, // ID diferente
                type: 'credit',
                description: `PIX de ${senderAccount.owner}`,
                amount: amount,
                date: dateStr
            });

            saveBankData(); // Salva as alterações

            alert(`Transferência de R$ ${amount.toFixed(2).replace('.', ',')} para ${recipientAccount.owner} realizada com sucesso (simulada)!`);
            window.location.href = 'conta.html'; // Redireciona para a página da conta
        });
    }

    // ----------------------------------------------------------------------
    // 4. Lógica de Logout (universal)
    // ----------------------------------------------------------------------
    const logoutLink = document.querySelector('.logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bankData'); // Limpa todos os dados do banco
            alert('Você foi desconectado com segurança.');
            window.location.href = 'index.html'; // Redireciona para a tela de login/inicial
        });
    }
});