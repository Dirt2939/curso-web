async function CarregarDados() {
    const resposta = await fetch("./aluno.json");
    const alunos = await resposta.json();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    alunos.forEach(aluno => {
        lista.innerHTML += `
        <div class="card">
            <h3>${aluno.nome}</h3>
            <p>Email: ${aluno.email}</p>
            <p>Idade: ${aluno.idade}</p>
            <p>Curso: ${aluno.curso}</p>
            <p>Cidade: ${aluno.cidade}</p>
        </div>`;
    });
}

