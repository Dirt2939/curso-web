const container = document.getElementById("container-cursos");
const filtroCategoria = document.getElementById("filtro-categoria");

let cursos = [];

async function buscarCursos() {
  try {
    const response = await fetch("cursos.json");

    if (!response.ok) {
      throw new Error("Erro ao carregar os cursos");
    }

    cursos = await response.json();

    renderizarCursos(cursos);
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p>Erro ao carregar os cursos.</p>
    `;
  }
}

function renderizarCursos(listaCursos) {
  container.innerHTML = listaCursos
    .map((curso) => {

      const modulosHTML = curso.modulos
        .map((modulo) => `<li>${modulo}</li>`)
        .join("");

      return `
        <div class="card ${
          curso.vagasEsgotadas ? "esgotado" : ""
        }">

          ${
            curso.vagasEsgotadas
              ? `<span class="tag">Inscrições Encerradas</span>`
              : ""
          }

          <span class="categoria">${curso.categoria}</span>

          <h2>${curso.titulo}</h2>

          <div class="instrutor">
            <strong>Instrutor:</strong>
            ${curso.instrutor.nome}
            (${curso.instrutor.experiencia})
          </div>

          <div>
            <strong>Módulos:</strong>

            <ul>
              ${modulosHTML}
            </ul>
          </div>

        </div>
      `;
    })
    .join("");
}

filtroCategoria.addEventListener("change", (event) => {
  const categoriaSelecionada = event.target.value;

  if (categoriaSelecionada === "Todos") {
    renderizarCursos(cursos);
    return;
  }

  const cursosFiltrados = cursos.filter(
    (curso) => curso.categoria === categoriaSelecionada
  );

  renderizarCursos(cursosFiltrados);
});

buscarCursos();