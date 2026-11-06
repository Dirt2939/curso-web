export const getInput = (id, tipo) => {
  const conteudo = document.getElementById(id).value;

  if (tipo === "num") return parseFloat(conteudo);
  else if (tipo === "vet") {
    return retornarVetor(conteudo);
  }

  function retornarVetor(nums) {
    return nums.split(",").map((n) => parseFloat(n.trim()));
  }

  return conteudo; // Retorna String
};

export const isNumInputValid = (lista) =>
  !lista.some(isNaN) || (alert("Digite números válidos"), false);

export const setText = (id, texto) =>
  (document.getElementById(id).innerHTML = texto);

export const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
