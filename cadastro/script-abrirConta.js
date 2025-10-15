////////////////////////////// ABRIR CONTA //////////////////////////////

// Seleção do formulário de cadastro
const formCadastro = document.querySelector('.cadastro-form');

// Função para gerar número de agência (0001 a 9999)
function gerarAgencia() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Função para gerar número de conta (000000 a 999999)
function gerarConta() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Formata conta para exibição: 123456 -> 12345-6
function formatarConta(conta) {
    const str = conta.toString().padStart(6, '0');
    return `${str.slice(0, 5)}-${str.slice(5)}`;
}

// Função para validar CPF (apenas formato básico)
function validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    return cpfLimpo.length === 11;
}

// Verifica se e-mail já existe
function emailExiste(email) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    return usuarios.some(u => u.email === email);
}

// Função para cadastrar usuário
function cadastrarUsuario(usuario) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// Função para mostrar alerta customizado
function mostrarAlerta(msg, tipo = 'erro') {
    // Remove alerta antigo se houver
    const alertaExistente = document.querySelector('.alerta');
    if (alertaExistente) alertaExistente.remove();

    const alerta = document.createElement('div');
    alerta.className = 'alerta ' + tipo;
    alerta.textContent = msg;
    formCadastro.prepend(alerta);

    // Remove depois de 5 segundos
    setTimeout(() => alerta.remove(), 10000);
}

// Evento de submit do formulário de cadastro
formCadastro.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome-completo').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const nascimento = document.getElementById('data-nascimento').value;
    const senha = document.getElementById('senha-cadastro').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const termos = document.getElementById('termos').checked;

    // Validações
    if (!nome || !cpf || !email || !nascimento || !senha || !confirmarSenha) {
        mostrarAlerta('Preencha todos os campos!');
        return;
    }

    if (!validarCPF(cpf)) {
        mostrarAlerta('CPF inválido! Use o formato 000.000.000-00');
        return;
    }

    if (senha.length < 6) {
        mostrarAlerta('Senha deve ter no mínimo 6 caracteres!');
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarAlerta('As senhas não conferem!');
        return;
    }

    if (!termos) {
        mostrarAlerta('Você deve aceitar os Termos e Condições!');
        return;
    }

    if (emailExiste(email)) {
        mostrarAlerta('Este e-mail já está cadastrado!');
        return;
    }

    // Cria usuário
    const usuario = {
        nome,
        cpf,
        email,
        nascimento,
        senha,
        agencia: gerarAgencia(),
        conta: gerarConta()
    };

    // Salva no localStorage
    cadastrarUsuario(usuario);

    // Limpa formulário
    formCadastro.reset();

    // Mostra sucesso e número da conta formatado
    mostrarAlerta(`Cadastro realizado com sucesso!
Agência: ${usuario.agencia} - Conta: ${formatarConta(usuario.conta)}`, 'sucesso');
});
