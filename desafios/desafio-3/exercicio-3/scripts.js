(async function () {

  const response = await fetch('filmes.json');
  const filmes = await response.json();

  const lista = document.querySelector(".lista");
  
  if (lista) {

    lista.innerHTML = filmes.map(filme => `
      <div class="card">
        <img src="${filme.img}" alt="${filme.nome}">
        <h3>${filme.nome}</h3>
        <p class="desc">${filme.descricao}</p>
        <p>Nota: ${filme.nota}</p>
        <p class="genero">${filme.genero}</p>
      </div>
    `).join(''); 
  }

  console.table(filmes);
})(); 