# 📚 Exercícios Práticos — JSON e Fetch API

Este repositório reúne uma sequência de exercícios focados em:

* Manipulação de arquivos JSON
* Uso da Fetch API
* Renderização dinâmica com JavaScript
* Manipulação de Arrays (`map`, `filter`, `find`, `reduce`)
* Criação de interfaces dinâmicas
* Estruturação de projetos Front-End

Cada exercício evolui gradualmente o nível de complexidade dos dados e da lógica utilizada.

---

# 🚀 Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* JSON
* Fetch API

---

# 📂 Estrutura do Projeto

```txt
projeto/
│
├── index.html
│
├── exercicio-1-2/
│   ├── index.html
│   ├── aluno.json
│   ├── CSS/
│   └── JS/
│
├── exercicio-3/
│   ├── index.html
│   ├── filmes.json
│   ├── scripts.js
│   └── img/
│
├── exercicio-4/
│   ├── index.html
│   ├── produtos.json
│   └── scripts.js
│
└── exercicio-5/
    ├── index.html
    ├── cursos.json
    └── script.js
```

---

# 🧠 Exercícios Desenvolvidos

---

## 👨‍🎓 Exercícios 1 e 2 — Sistema de Alunos

### Objetivos

* Trabalhar com JSON básico
* Consumir dados com JavaScript
* Exibir informações dinamicamente na tela
* Adicionar novas propriedades aos objetos

### Conceitos utilizados

* `fetch()`
* `innerHTML`
* Arrays de objetos
* Template Literals

### Dados exibidos

* Nome
* Idade
* Curso
* Cidade
* Email

---

## 🎬 Exercício 3 — Catálogo de Filmes

### Objetivos

* Criar um sistema do zero
* Trabalhar com listagem dinâmica
* Renderizar cards de filmes

### Estrutura do JSON

Cada filme contém:

```json
{
  "nome": "Interestelar",
  "nota": 9.5,
  "genero": "Ficção Científica"
}
```

### Conceitos utilizados

* `.map()`
* `.join()`
* Cards dinâmicos
* Organização visual com CSS

---

## 🛒 Exercício 4 — E-commerce de Produtos

### Objetivos

* Simular uma loja virtual
* Trabalhar com estoque
* Aplicar renderização condicional

### Estrutura do JSON

Cada produto contém:

```json
{
  "nome": "Mouse Gamer",
  "preco": 149.90,
  "categoria": "Periféricos",
  "estoque": 5
}
```

### Conceitos utilizados

* `Intl.NumberFormat`
* Condicionais
* Botões dinâmicos
* Controle de estoque

---

## 🎓 Exercício 5 — Painel de Cursos

### Objetivos

* Trabalhar com dados aninhados
* Criar filtros dinâmicos
* Manipular arrays internos

### Estrutura do JSON

```json
{
  "titulo": "React do Zero",
  "categoria": "Programação",
  "instrutor": {
    "nome": "Ana Silva",
    "experiencia": "Senior Dev"
  },
  "modulos": [
    "Componentes",
    "Hooks",
    "APIs"
  ]
}
```

### Conceitos utilizados

* Objetos aninhados
* `.filter()`
* `.map()`
* Renderização de listas
* Eventos (`addEventListener`)
* Filtro por categoria

---

# ⚡ Métodos Importantes Utilizados

---

## `.map()`

Transforma elementos de um array.

```js
const lista = nomes.map(nome => `<li>${nome}</li>`);
```

---

## `.join()`

Une todos os itens do array em uma string única.

```js
lista.join('');
```

---

## `.filter()`

Filtra elementos com base em uma condição.

```js
const produtos = lista.filter(item => item.preco > 100);
```

---

## `.find()`

Busca o primeiro item correspondente.

```js
const usuario = usuarios.find(user => user.id === 1);
```

---

## `.reduce()`

Acumula valores.

```js
const total = carrinho.reduce((acc, item) => {
  return acc + item.preco;
}, 0);
```

---

# ▶️ Como Executar

## 1. Instale a extensão Live Server no VSCode

Extensão:

https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

---

## 2. Abra o projeto no VSCode

---

## 3. Execute com Live Server

Clique com o botão direito no:

```txt
index.html
```

E selecione:

```txt
Open with Live Server
```

---

# ⚠️ Importante

Os projetos utilizam `fetch()` para carregar arquivos `.json`.

Por isso, abrir os arquivos diretamente com:

```txt
file://
```

vai gerar erro de CORS e bloqueio do navegador.

Use sempre um servidor local.

Porque navegadores modernos decidiram que segurança vale mais do que nossa paz mental.

---

# 📖 Aprendizados

Este conjunto de exercícios ajuda a desenvolver:

* Manipulação de dados
* Consumo de APIs
* Estruturação de interfaces dinâmicas
* Organização de projetos Front-End
* Pensamento lógico com arrays e objetos

Tudo isso enquanto você lentamente percebe que praticamente toda aplicação web moderna é:

```txt
JSON → JavaScript → HTML
```

E bilhões de dólares foram construídos em cima disso.
