////////////////////////////// LOGIN - ADAPTADO PARA APENAS CONTA E SENHA //////////////////////////////

// A agência será fixada para simplificar
const AGENCY_ID = '0001'; 

// Função para desformatar conta para pesquisa: 12345-6 -> 123456
function desformatarConta(contaFormatada) {
    return contaFormatada.replace(/[^\d]/g, '').padStart(6, '0');
}

// Função para mostrar mensagem de erro ou sucesso
function mostrarMensagem(msg, tipo = 'erro') {
    const formLogin = document.querySelector('.login-form');
    if (!formLogin) return; 

    const mensagemAntiga = document.querySelector('.mensagem-login');
    if (mensagemAntiga) mensagemAntiga.remove();

    const divMsg = document.createElement('div');
    divMsg.className = 'mensagem-login ' + tipo;
    divMsg.textContent = msg;

    formLogin.prepend(divMsg);
    setTimeout(() => divMsg.remove(), 5000);
}


// Função de login (agora centralizando a lógica de teste e cadastro)
function login(e) {
    e.preventDefault(); 
    
    // Seleção dos campos DENTRO da função de evento
    const inputConta = document.getElementById('conta');
    const inputSenha = document.getElementById('senha');
    
    const contaFormatadaDigitada = inputConta.value.trim();
    const senhaDigitada = inputSenha.value;

    if (!contaFormatadaDigitada || !senhaDigitada) {
        mostrarMensagem('Preencha todos os campos!');
        return;
    }
    
    const contaPuraDigitada = desformatarConta(contaFormatadaDigitada); 
    const accountKey = `${AGENCY_ID}-${contaPuraDigitada}`; 

    let usuarioEncontrado = null;
    
    // Busca os dados do sistema (Chama a função global)
    const bankData = window.loadBankData ? window.loadBankData() : null; 
    
    if (!bankData) {
        mostrarMensagem('Erro de sistema: Dados não carregados. Verifique o console.');
        return;
    }

    // 1. TENTA LOGAR COM AS CONTAS DE TESTE
    if (bankData.accounts[accountKey] && senhaDigitada === '123') {
        usuarioEncontrado = bankData.accounts[accountKey];
        usuarioEncontrado.agencia = AGENCY_ID;
        usuarioEncontrado.conta = contaPuraDigitada;
    } 
    
    // 2. TENTA LOGAR COM USUÁRIOS NOVOS CADASTRADOS
    if (!usuarioEncontrado) {
        const usuariosCadastrados = JSON.parse(localStorage.getItem('usuarios')) || [];
        
        usuarioEncontrado = usuariosCadastrados.find(u => 
            u.conta.toString() === contaPuraDigitada && u.senha === senhaDigitada
        );

        if (!usuarioEncontrado) {
             mostrarMensagem('Conta e/ou senha não conferem. Verifique os dados!');
             inputConta.focus();
             return;
        }
    }
    
    // 3. LOGIN BEM-SUCEDIDO: Configura e Salva o usuário logado
    const contaLogada = {
        nome: usuarioEncontrado.owner || usuarioEncontrado.nome,
        agencia: usuarioEncontrado.agencia || AGENCY_ID,
        conta: usuarioEncontrado.account || usuarioEncontrado.conta
    };

    localStorage.setItem('usuarioLogado', JSON.stringify(contaLogada));
    mostrarMensagem(`Bem-vindo, ${contaLogada.nome.split(' ')[0]}! Redirecionando...`, 'sucesso');

    setTimeout(() => {
        window.location.href = 'conta.html';
    }, 1000);
}


// EVENT LISTENER CRÍTICO: Anexa o evento de login apenas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.querySelector('.login-form');
    
    // Inicialização do Sistema (Para garantir que os dados estejam prontos)
    if (window.loadBankData && typeof window.loadBankData === 'function') {
        window.loadBankData(); 
    }

    if (formLogin) {
        // Anexa a função 'login' que contém o e.preventDefault()
        formLogin.addEventListener('submit', login); 
    }
});