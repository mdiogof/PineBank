// Seleção do formulário e campos
const formReset = document.querySelector('.reset-form');
const inputConta = document.getElementById('conta');
const inputNovaSenha = document.getElementById('nova-senha');
const inputConfirmarNovaSenha = document.getElementById('confirmar-nova-senha');

// Formata conta: 123456 -> 12345-6
function formatarConta(conta) {
    const str = conta.toString().padStart(6, '0');
    return `${str.slice(0,5)}-${str.slice(5)}`;
}

// Mensagem
function mostrarMensagem(msg, tipo='erro') {
    const mensagemAntiga = document.querySelector('.mensagem-reset');
    if (mensagemAntiga) mensagemAntiga.remove();

    const divMsg = document.createElement('div');
    divMsg.className = 'mensagem-reset ' + tipo;
    divMsg.textContent = msg;

    formReset.prepend(divMsg);

    setTimeout(() => divMsg.remove(), 5000);
}

// Evento submit
formReset.addEventListener('submit', function(e){
    e.preventDefault();

    const contaDigitada = inputConta.value.trim();
    const novaSenha = inputNovaSenha.value;
    const confirmarSenha = inputConfirmarNovaSenha.value;

    if (!contaDigitada || !novaSenha || !confirmarSenha) {
        mostrarMensagem('Preencha todos os campos!');
        return;
    }

    if (novaSenha.length < 6) {
        mostrarMensagem('Senha deve ter no mínimo 6 caracteres!');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarMensagem('As senhas não conferem!');
        return;
    }

    // Busca usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => formatarConta(u.conta) === contaDigitada);

    if (!usuario) {
        mostrarMensagem('Conta não encontrada!');
        return;
    }

    // Atualiza senha
    usuario.senha = novaSenha;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    mostrarMensagem('Senha alterada com sucesso! Redirecionando para login...', 'sucesso');

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);

    formReset.reset();
});
