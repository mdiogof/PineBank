////////////////////////////// LOGIN //////////////////////////////

// Seleção do formulário e campos
const formLogin = document.querySelector('.login-form');
const inputConta = document.getElementById('conta');
const inputSenha = document.getElementById('senha');

// Formata conta para exibição: 123456 -> 12345-6
function formatarConta(conta) {
    const str = conta.toString().padStart(6, '0');
    return `${str.slice(0, 5)}-${str.slice(5)}`;
}

// Função para mostrar mensagem de erro ou sucesso
function mostrarMensagem(msg, tipo = 'erro') {
    const mensagemAntiga = document.querySelector('.mensagem-login');
    if (mensagemAntiga) mensagemAntiga.remove();

    const divMsg = document.createElement('div');
    divMsg.className = 'mensagem-login ' + tipo;
    divMsg.textContent = msg;

    formLogin.prepend(divMsg);

    // Remove automaticamente após 5s
    setTimeout(() => divMsg.remove(), 5000);
}

// Função de login
function login() {
    const contaDigitada = inputConta.value.trim();
    const senhaDigitada = inputSenha.value;

    if (!contaDigitada || !senhaDigitada) {
        mostrarMensagem('Preencha todos os campos!');
        return;
    }

    // Busca usuários cadastrados
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Procura usuário pela conta (comparando formato)
    const usuarioEncontrado = usuarios.find(u => formatarConta(u.conta) === contaDigitada);

    if (!usuarioEncontrado) {
        mostrarMensagem('Conta não encontrada!');
        inputConta.focus();
        return;
    }

    // Verifica senha
    if (usuarioEncontrado.senha !== senhaDigitada) {
        mostrarMensagem('Senha incorreta!');
        inputSenha.focus();
        return;
    }

    // Login bem-sucedido
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
    mostrarMensagem(`Bem-vindo, ${usuarioEncontrado.nome}! Redirecionando...`, 'sucesso');

    // Redireciona para dashboard/conta.html
    setTimeout(() => {
        window.location.href = 'conta.html';
    }, 1000);
}

// Permitir Enter no teclado para enviar
formLogin.addEventListener('submit', e => {
    e.preventDefault();
    login();
});
