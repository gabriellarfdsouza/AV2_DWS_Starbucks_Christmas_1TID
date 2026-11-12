
/* =========================================
   1. CATÁLOGO DE PRODUTOS E CARRINHO
   ========================================= */

(function () {
    var listaProdutos = document.getElementById("lista-produtos");
    var campoBusca = document.getElementById("busca");
    var filtroCategoria = document.getElementById("categoria");
    var resultadoProdutos = document.getElementById("resultado-produtos");
    var produtos = window.produtos;
    var ordenacao = document.getElementById("ordenacao");

    var elementosCatalogo = [
        listaProdutos,
        campoBusca,
        filtroCategoria,
        resultadoProdutos,
        ordenacao
    ];

    if (elementosCatalogo.every(function (elemento) {
        return !elemento;
    })) {
        return;
    }

    if (elementosCatalogo.some(function (elemento) {
        return !elemento;
    })) {
        console.error("Os elementos do catálogo de produtos não foram encontrados.");
        return;
    }

    if (!Array.isArray(produtos)) {
        console.error("O catálogo de produtos não foi carregado.");
        return;
    }

    var formatadorPreco = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    function normalizar(texto) {
        return texto
            .toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    /* CRIAR CARDS DOS PRODUTOS */

    function criarCard(produto) {
        var card = document.createElement("article");
        var imagem = document.createElement("img");
        var conteudo = document.createElement("div");
        var nome = document.createElement("h3");
        var descricao = document.createElement("p");
        var preco = document.createElement("p");
        var botoes = document.createElement("div");
        var botaoAdicionar = document.createElement("button");

        card.className = "card-produto";
        card.dataset.id = produto.id;

        imagem.src = produto.imagem;
        imagem.alt = produto.nome;
        imagem.loading = "lazy";
        imagem.decoding = "async";

        conteudo.className = "card-produto__conteudo";

        nome.textContent = produto.id + ". " + produto.nome;
        descricao.textContent = produto.descricao;

        preco.className = "preco-produto";
        preco.textContent = formatadorPreco.format(produto.preco);

        botoes.className = "botoes-produto";

        botaoAdicionar.type = "button";
        botaoAdicionar.className = "botao-adicionar";
        botaoAdicionar.textContent = "Adicionar ao carrinho";
        botaoAdicionar.dataset.id = produto.id;

        botoes.appendChild(botaoAdicionar);
        conteudo.append(nome, descricao, preco);

        if (produto.destaque) {
            var selo = document.createElement("span");
            selo.className = "selo-produto";
            selo.textContent = "Especial de Natal";
            conteudo.appendChild(selo);
        }

        conteudo.appendChild(botoes);
        card.append(imagem, conteudo);

        return card;
    }

    /* MOSTRAR PRODUTOS NA TELA */

    function mostrarProdutos(lista) {
        listaProdutos.textContent = "";

        if (lista.length === 0) {
            var vazio = document.createElement("p");
            vazio.className = "sem-produtos";
            vazio.textContent = "❄️ Nenhum produto encontrado 🎄";
            listaProdutos.appendChild(vazio);
            resultadoProdutos.textContent = "0 produtos encontrados.";
            return;
        }

        var fragmento = document.createDocumentFragment();

        lista.forEach(function (produto) {
            fragmento.appendChild(criarCard(produto));
        });

        listaProdutos.appendChild(fragmento);

        resultadoProdutos.textContent =
            lista.length +
            (lista.length === 1 ? " produto encontrado." : " produtos encontrados.");
    }

    /* BUSCA E FILTRO DE CATEGORIAS */

    function filtrarProdutos() {
        var busca = normalizar(campoBusca.value.trim());
        var categoria = filtroCategoria.value;

        var filtrados = produtos.filter(function (produto) {
            var nomeEncontrado = normalizar(produto.nome).includes(busca);
            var categoriaEncontrada =
                categoria === "todos" || produto.categoria === categoria;

            return nomeEncontrado && categoriaEncontrada;
        });

        if (ordenacao.value === "menor") {
            filtrados.sort(function (a, b) {
                return a.preco - b.preco;
            });
        } else if (ordenacao.value === "maior") {
            filtrados.sort(function (a, b) {
                return b.preco - a.preco;
            });
        }

        mostrarProdutos(filtrados);
    }

    ordenacao.addEventListener("change", filtrarProdutos);

    /* CARRINHO DE COMPRAS */

    var carrinho = [];

    var avisoCarrinho = document.createElement("p");
    avisoCarrinho.className = "aviso-carrinho";
    avisoCarrinho.textContent = "Carrinho: 0 itens";
    avisoCarrinho.setAttribute("aria-live", "polite");

    listaProdutos.parentNode.insertBefore(avisoCarrinho, listaProdutos);

    listaProdutos.addEventListener("click", function (evento) {
        var botao = evento.target.closest(".botao-adicionar");

        if (!botao) return;

        var id = Number(botao.dataset.id);

        var produto = produtos.find(function (item) {
            return item.id === id;
        });

        if (!produto) return;

        var itemCarrinho = carrinho.find(function (item) {
            return item.produto.id === id;
        });

        if (itemCarrinho) {
            itemCarrinho.quantidade++;
        } else {
            carrinho.push({
                produto: produto,
                quantidade: 1
            });
        }

        var totalItens = carrinho.reduce(function (total, item) {
            return total + item.quantidade;
        }, 0);

        avisoCarrinho.textContent =
            produto.nome + " adicionado! Carrinho: " +
            totalItens + (totalItens === 1 ? " item" : " itens") + ".";
    });
/* MODAL DE DETALHES DO PRODUTO */

var modal = document.getElementById("modal-produto");
var modalImagem = document.getElementById("modal-imagem");
var modalNome = document.getElementById("modal-nome");
var modalDescricao = document.getElementById("modal-descricao");
var modalPreco = document.getElementById("modal-preco");
var fecharModal = document.getElementById("fechar-modal");

if (modal && modalImagem && modalNome && modalDescricao && modalPreco && fecharModal) {

    listaProdutos.addEventListener("click", function (evento) {
        if (!evento.target.matches("img, h3")) return;

        var card = evento.target.closest(".card-produto");
        if (!card) return;

        var id = Number(card.dataset.id);

        var produto = produtos.find(function (item) {
            return item.id === id;
        });

        if (!produto) return;

        modalImagem.src = produto.imagem;
        modalImagem.alt = produto.nome;
        modalNome.textContent = produto.nome;
        modalDescricao.textContent = produto.descricao;
        modalPreco.textContent = formatadorPreco.format(produto.preco);

        modal.hidden = false;
    });

    fecharModal.addEventListener("click", function () {
        modal.hidden = true;
    });

    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            modal.hidden = true;
        }
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            modal.hidden = true;
        }
    });
}
    /* ATIVAR BUSCA E FILTROS */

    campoBusca.addEventListener("input", filtrarProdutos);
    filtroCategoria.addEventListener("change", filtrarProdutos);

    mostrarProdutos(produtos);

})();


/* =========================================
   2. SLIDESHOW DE NATAL
   ========================================= */

(function () {
    var slides = document.querySelectorAll(".slide");
    var indicadores = document.querySelectorAll(".indicador");
    var anterior = document.querySelector(".slide-anterior");
    var proximo = document.querySelector(".slide-proximo");

    if (!slides.length || !indicadores.length || !anterior || !proximo) {
        return;
    }

    var slideAtual = 0;
    var intervalo;

    function mostrarSlide(indice) {
        slides[slideAtual].classList.remove("ativo");
        indicadores[slideAtual].classList.remove("ativo");

        slideAtual = (indice + slides.length) % slides.length;

        slides[slideAtual].classList.add("ativo");
        indicadores[slideAtual].classList.add("ativo");
    }

    function iniciarAutomatico() {
        clearInterval(intervalo);

        intervalo = setInterval(function () {
            mostrarSlide(slideAtual + 1);
        }, 5000);
    }

    anterior.addEventListener("click", function () {
        mostrarSlide(slideAtual - 1);
        iniciarAutomatico();
    });

    proximo.addEventListener("click", function () {
        mostrarSlide(slideAtual + 1);
        iniciarAutomatico();
    });

    indicadores.forEach(function (indicador, indice) {
        indicador.addEventListener("click", function () {
            mostrarSlide(indice);
            iniciarAutomatico();
        });
    });

    iniciarAutomatico();
})();


/* =========================================
   3. EFEITO PARALLAX
   ========================================= */

(function () {
    var texto = document.querySelector(".hero-copy");
    var imagem = document.querySelector(".hero-visual");

    if (!texto || !imagem) {
        return;
    }

    function aplicarParallax() {
        var rolagem = Math.min(window.scrollY, 300);

        texto.style.transform = "translateY(" + (rolagem * -0.08) + "px)";
        imagem.style.transform = "translateY(" + (rolagem * -0.18) + "px)";
    }

    window.addEventListener("scroll", aplicarParallax, { passive: true });

    aplicarParallax();
})();


/* =========================================
   4. MÚSICA DE FUNDO
   ========================================= */

(function () {
    var botao = document.getElementById("botao-musica");
    var musica = document.getElementById("musica-fundo");

    if (!botao || !musica) {
        return;
    }

    musica.volume = 0.2;

    botao.addEventListener("click", function () {
        if (musica.paused) {
            musica.play()
                .then(function () {
                    botao.textContent = "♫ Pausar música";
                })
                .catch(function () {
                    botao.textContent = "Não foi possível tocar";
                });
        } else {
            musica.pause();
            botao.textContent = "♫ Tocar música";
        }
    });

    musica.addEventListener("ended", function () {
        botao.textContent = "♫ Tocar música";
    });
})();


/* =========================================
   5. CONTADOR REGRESSIVO PARA O NATAL
   ========================================= */

(function () {
    var dias = document.getElementById("dias");
    var horas = document.getElementById("horas");
    var minutos = document.getElementById("minutos");
    var segundos = document.getElementById("segundos");

    if (!dias || !horas || !minutos || !segundos) {
        return;
    }

    function atualizarContador() {
        var agora = new Date();
        var natal = new Date(agora.getFullYear(), 11, 25, 0, 0, 0);

        if (agora >= natal) {
            natal.setFullYear(natal.getFullYear() + 1);
        }

        var diferenca = natal - agora;

        if (diferenca <= 0) {
            dias.textContent = "00";
            horas.textContent = "00";
            minutos.textContent = "00";
            segundos.textContent = "00";
            return;
        }

        dias.textContent = Math.floor(diferenca / 86400000);
        horas.textContent = Math.floor(diferenca / 3600000) % 24;
        minutos.textContent = Math.floor(diferenca / 60000) % 60;
        segundos.textContent = Math.floor(diferenca / 1000) % 60;
    }

    atualizarContador();
    setInterval(atualizarContador, 1000);
})();


/* =========================================
   6. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
   ========================================= */

(function () {
    var formulario = document.querySelector("form");
    var mensagem = document.getElementById("mensagem-form");

    if (!formulario || !mensagem) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        var nome = document.getElementById("nome").value.trim();
        var email = document.getElementById("email").value.trim();
        var assunto = document.getElementById("assunto").value.trim();
        var texto = document.getElementById("mensagem").value.trim();

        if (!nome || !email || !assunto || !texto) {
            mensagem.textContent = "Por favor, preencha todos os campos.";
            mensagem.style.color = "#a52f40";
            return;
        }

        var formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(email)) {
            mensagem.textContent = "Digite um e-mail válido.";
            mensagem.style.color = "#a52f40";
            return;
        }

        mensagem.textContent =
            "Mensagem preenchida com sucesso! Obrigado pelo contato.";
        mensagem.style.color = "#527a52";

        formulario.reset();
    });
})();


/* =========================================
   7. MENU HAMBÚRGUER
   ========================================= */

(function () {
    var botao = document.getElementById("botao-menu");
    var menu = document.getElementById("menu");

    if (!botao || !menu) {
        return;
    }

    botao.addEventListener("click", function () {
        menu.classList.toggle("menu-aberto");

        var aberto = menu.classList.contains("menu-aberto");

        botao.setAttribute("aria-expanded", aberto);
        botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        botao.textContent = aberto ? "✕" : "☰";
    });
})();


/* =========================================
   8. NEVE CAINDO
   ========================================= */

(function () {
    var quantidade = 35;

    for (var i = 0; i < quantidade; i++) {
        var floco = document.createElement("span");

        floco.classList.add("floco-neve");
        floco.textContent = "❄";

        floco.style.left = Math.random() * 100 + "vw";
        floco.style.fontSize = (Math.random() * 8 + 7) + "px";
        floco.style.animationDuration = (Math.random() * 8 + 7) + "s";
        floco.style.animationDelay = (Math.random() * 10) + "s";

        document.body.appendChild(floco);
    }
})();
