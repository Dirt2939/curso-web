async function carregarProdutos() {
  try {
    const response = await fetch("produtos.json");

    if (!response.ok) {
      throw new Error("Erro ao buscar o arquivo JSON");
    }

    const produtos = await response.json();
    const container = document.querySelector(".grid-produtos");

    if (container) {
      container.innerHTML = produtos
        .map((produto) => {
          const precoFormatado = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(produto.preco);

          const temEstoque = produto.estoque > 0;

          const textoEstoque = temEstoque
            ? `Em estoque: ${produto.estoque} unid.`
            : "Esgotado";

          const classeEstoque = temEstoque
            ? "estoque"
            : "estoque sem-estoque";

          return `
            <div class="card">
              <img src="${produto.img}" alt="${produto.nome}">
              
              <div class="card-info">
                <span class="categoria">${produto.categoria}</span>
                <h2>${produto.nome}</h2>
                <p class="preco">${precoFormatado}</p>
                <p class="${classeEstoque}">${textoEstoque}</p>

                <button class="btn-comprar" ${
                  !temEstoque ? "disabled" : ""
                }>
                  ${temEstoque ? "Adicionar ao Carrinho" : "Indisponível"}
                </button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  } catch (error) {
    console.error("Houve um erro:", error);

    document.querySelector(".grid-produtos").innerHTML =
      "<p>Erro ao carregar o catálogo de produtos.</p>";
  }
}

carregarProdutos();