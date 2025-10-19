document.addEventListener('DOMContentLoaded', function() {
  const tabBotoes = document.querySelectorAll('.tab-btn');
  const contentPanels = document.querySelectorAll('.content-panel');

  tabBotoes.forEach(botao => {
    botao.addEventListener('click', function() {
      // 1. Pega o ID do painel alvo (ex: "tab-1")
      const tabId = this.getAttribute('data-tab');

      // 2. Remove "ativo" de TODOS os botões e painéis
      tabBotoes.forEach(btn => btn.classList.remove('ativo'));
      contentPanels.forEach(panel => panel.classList.remove('ativo'));

      // 3. Adiciona "ativo" APENAS no botão clicado
      this.classList.add('ativo');

      // 4. Adiciona "ativo" APENAS no painel correspondente
      const painelAlvo = document.getElementById(tabId);
      painelAlvo.classList.add('ativo');
    });
  });
});