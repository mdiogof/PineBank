document.addEventListener('DOMContentLoaded', function() {
  const beneficios = document.querySelectorAll('.beneficio-item');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProximo = document.getElementById('btn-proximo');
  let indiceAtual = 0;

  function mostrarBeneficio(indice) {
    // Esconde todos os benefícios
    beneficios.forEach(item => {
      item.classList.remove('ativo');
    });

    // Mostra o benefício do índice selecionado
    beneficios[indice].classList.add('ativo');
  }

  function proximoBeneficio() {
    indiceAtual++;
    if (indiceAtual >= beneficios.length) {
      indiceAtual = 0; // Volta para o primeiro
    }
    mostrarBeneficio(indiceAtual);
  }

  function anteriorBeneficio() {
    indiceAtual--;
    if (indiceAtual < 0) {
      indiceAtual = beneficios.length - 1; // Vai para o último
    }
    mostrarBeneficio(indiceAtual);
  }

  // Adiciona os eventos de clique nos botões
  btnProximo.addEventListener('click', proximoBeneficio);
  btnAnterior.addEventListener('click', anteriorBeneficio);

  // Inicia mostrando o primeiro benefício
  mostrarBeneficio(indiceAtual);
});