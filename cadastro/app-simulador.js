'use strict';

// Configurações e Taxas de Simulação (Valores fixos para demonstração)
const SIMULATOR_CONFIG = {
    cdb: {
        name: "CDB / Renda Fixa",
        rate: 0.12, // 12% a.a. (Simulação de 110% CDI com Selic de 10.9%)
        info: "Taxa: 110% CDI (Simulação). Lembre-se: IR regressivo incide sobre o lucro."
    },
    tesouro: {
        name: "Tesouro Direto",
        rate: 0.08, // 8% a.a. (Simulação de Taxa Selic + Prêmios)
        info: "Taxa: Estimativa Selic (8% a.a.). IR regressivo incide sobre o lucro."
    },
    lci_lca: {
        name: "LCI / LCA",
        rate: 0.095, // 9.5% a.a.
        info: "Taxa: 95% CDI (Simulação). GRANDE VANTAGEM: Isento de Imposto de Renda!"
    },
    fundos: {
        name: "Fundos Multimercado",
        rate: 0.15, // 15% a.a. (Simulação de Alto Risco/Retorno)
        info: "Taxa: 15% a.a. (Estimativa). Maior potencial, mas sem garantia do FGC."
    }
};

// Cálculo do Imposto de Renda (IR) Regressivo Brasileiro (sobre o lucro)
function calculateIR(months, grossProfit) {
    if (months <= 6) return 0.225 * grossProfit;        // 22.5%
    if (months <= 12) return 0.20 * grossProfit;         // 20.0%
    if (months <= 24) return 0.175 * grossProfit;        // 17.5%
    return 0.15 * grossProfit;                           // 15.0%
}

// Função principal de Simulação
function runSimulation(initialValue, months, productKey) {
    const config = SIMULATOR_CONFIG[productKey];
    if (!config) return null;

    const rateAnnual = config.rate;
    const rateMonthly = rateAnnual / 12;
    
    // Calcula o valor futuro (Juros Compostos)
    const finalValue = initialValue * Math.pow(1 + rateMonthly, months);
    
    const grossProfit = finalValue - initialValue;
    let netProfit = grossProfit;
    let irDiscounted = 0;

    // Aplica IR (exceto para LCI/LCA)
    if (productKey !== 'lci_lca') {
        irDiscounted = calculateIR(months, grossProfit);
        netProfit = grossProfit - irDiscounted;
    }

    return {
        finalValue: finalValue,
        grossProfit: grossProfit,
        netProfit: netProfit,
        irDiscounted: irDiscounted,
        months: months
    };
}


document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos da tela
    const productSelector = document.getElementById('product-selector');
    const simulationFormArea = document.getElementById('simulation-form-area');
    const resultsArea = document.getElementById('results-area');
    const form = document.getElementById('simulador-form');
    const productNameEl = document.getElementById('product-name');
    const taxaInfoEl = document.getElementById('taxa-info');

    let selectedProduct = null;
    
    // 1. SELEÇÃO DE PRODUTO
    productSelector.querySelectorAll('.simulador-product-card').forEach(card => {
        card.addEventListener('click', () => {
            // Remove seleção anterior
            productSelector.querySelector('.selected')?.classList.remove('selected');
            
            // Define o novo produto
            card.classList.add('selected');
            selectedProduct = card.dataset.product;

            const config = SIMULATOR_CONFIG[selectedProduct];
            productNameEl.textContent = config.name;
            taxaInfoEl.textContent = config.info;
            
            // Mostra o formulário
            simulationFormArea.classList.remove('hidden');
            resultsArea.classList.add('hidden'); // Esconde resultados antigos
        });
    });

    // 2. SUBMISSÃO DO FORMULÁRIO
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const initialValue = parseFloat(document.getElementById('valor-inicial').value.replace(',', '.'));
            const months = parseInt(document.getElementById('prazo-meses').value);
            
            if (isNaN(initialValue) || initialValue < 100 || isNaN(months) || months < 3 || !selectedProduct) {
                alert("Por favor, selecione um produto e insira valores válidos (Mínimo R$ 100 por 3 meses).");
                return;
            }

            const result = runSimulation(initialValue, months, selectedProduct);
            
            if (result) {
                // 3. PREENCHIMENTO DOS RESULTADOS
                
                // Função formatCurrency deve ser global (definida em bank-system.js)
                const format = window.formatCurrency || ((amount) => `R$ ${amount.toFixed(2).replace('.', ',')}`);
                
                document.getElementById('res-prazo').textContent = result.months;
                document.getElementById('res-valor-final').textContent = format(result.finalValue);
                document.getElementById('res-ganho-bruto').textContent = format(result.grossProfit);
                document.getElementById('res-ganho-liquido').textContent = format(result.netProfit);
                
                // Detalhes adicionais
                let taxaFinalInfoText = `IR Descontado: ${format(result.irDiscounted)}.`;
                if (selectedProduct === 'lci_lca') {
                    taxaFinalInfoText = `VANTAGEM: Não houve desconto de IR (${format(0.00)}).`;
                }

                document.getElementById('taxa-final-info').textContent = taxaFinalInfoText;

                resultsArea.classList.remove('hidden');
            }
        });
    }
});