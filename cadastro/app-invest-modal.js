'use strict';

// ------------------------------------------------------------------
// FUNÇÃO CRÍTICA: LÊ OS DADOS ATUAIS DE INVESTIMENTO DO LOCAL STORAGE
// ------------------------------------------------------------------
function getInvestedProducts() {
    const bankDataString = localStorage.getItem('bankData');
    if (!bankDataString) return [];
    
    const bankData = JSON.parse(bankDataString);
    const currentUserInfo = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!currentUserInfo) return [];

    const currentAccountKey = `${currentUserInfo.agencia}-${currentUserInfo.conta}`;
    const currentUser = bankData.accounts[currentAccountKey];

    if (!currentUser || !currentUser.investments || !currentUser.investments.products) {
        return [];
    }
    
    const products = currentUser.investments.products;

    // Mapeia os dados, garantindo que o valor do 'type' seja usado
    const allProducts = [
        { name: "CDB 110% CDI", value: "cdb" },
        { name: "Tesouro Selic", value: "tesouro" },
        { name: "LCI e LCA", value: "lci_lca" },
        { name: "Fundos de Investimento", value: "fundos" }
    ];

    return allProducts.map(p => {
        const productData = products.find(prod => prod.type === p.value);
        return {
            name: p.name,
            value: p.value,
            saldo: productData ? productData.value : 0.00,
            type: p.value
        };
    }).filter(p => p.saldo > 0); // Só mostra produtos com saldo positivo
}


// ------------------------------------------------------------------
// FUNÇÃO PARA ATUALIZAR O TEXTO DE SALDO DISPONÍVEL
// ------------------------------------------------------------------

window.updateInvestedBalance = function() {
    const selectEl = document.getElementById('investimento-origem');
    const saldoInfoEl = document.getElementById('saldo-investido-disponivel');

    if (!selectEl || !saldoInfoEl) return;
    
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    
    // Pega o saldo do atributo de dado
    const saldo = parseFloat(selectedOption.getAttribute('data-saldo'));
    
    if (isNaN(saldo)) {
        saldoInfoEl.textContent = "Selecione um investimento para ver o saldo.";
        return;
    }
    
    const format = window.formatCurrency || ((amount) => `R$ ${amount.toFixed(2).replace('.', ',')}`);

    saldoInfoEl.textContent = `Disponível para resgate: ${format(saldo)}`;
    saldoInfoEl.style.color = (saldo > 0) ? 'var(--verde-principal)' : 'var(--cor-secundaria)';
}


// ------------------------------------------------------------------
// INICIALIZAÇÃO E POPULAÇÃO DO SELECT
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const selectEl = document.getElementById('investimento-origem') || document.getElementById('investimento-destino');
    
    if (!selectEl) return;
    
    // VERIFICA SE ESTAMOS NA TELA DE APORTE OU RESGATE
    const isAportePage = selectEl.id === 'investimento-destino';

    let products = getInvestedProducts(); // Pega produtos com saldo > 0

    // --- CORREÇÃO CRÍTICA: Se for Aporte, força a lista completa de 4 produtos.
    if (isAportePage) {
        // Lista completa de 4 produtos com saldo zerado (para display)
        const allPossibleProducts = [
             { name: "CDB 110% CDI", value: "cdb", saldo: 0.00, type: 'cdb' },
             { name: "Tesouro Selic", value: "tesouro", saldo: 0.00, type: 'tesouro' },
             { name: "LCI e LCA", value: "lci_lca", saldo: 0.00, type: 'lci_lca' },
             { name: "Fundos de Investimento", value: "fundos", saldo: 0.00, type: 'fundos' }
        ];

        // Se o usuário já tem saldo em algum produto, substitui o saldo 0 pelo saldo real
        products = allPossibleProducts.map(possibleProduct => {
            const currentProduct = products.find(p => p.type === possibleProduct.type);
            return currentProduct || possibleProduct; // Usa o saldo real se existir, ou o saldo zero.
        });
    }
    // --- FIM DA CORREÇÃO CRÍTICA ---
    
    selectEl.innerHTML = '';
    
    selectEl.innerHTML += '<option value="" data-saldo="0" disabled selected>Selecione um produto...</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.type; 
        option.textContent = `${product.name}`;
        
        // Garante que o atributo saldo esteja sempre presente (seja 0.00 ou o valor real)
        option.setAttribute('data-saldo', product.saldo.toFixed(2)); 
        selectEl.appendChild(option);
    });

    // Anexa listener e pré-seleciona
    selectEl.addEventListener('change', window.updateInvestedBalance);
    
    if (selectEl.options.length > 1) {
        selectEl.selectedIndex = 1; 
        window.updateInvestedBalance(); 
    }
});