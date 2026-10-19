/*
  CONFIGURAÇÃO
  O GitHub Pages só hospeda arquivos estáticos e não guarda o que é enviado.
  Para receber as denúncias de verdade, crie um formulário gratuito em
  https://formspree.io e cole o endereço abaixo, por exemplo:
  const ENDPOINT = "https://formspree.io/f/xxxxxxxx";
  Se ficar vazio, a denúncia é salva só no navegador (modo demonstração).
*/
const ENDPOINT = "";

const form = document.getElementById("form-denuncia");
const relato = document.getElementById("relato");
const contador = document.getElementById("contador");
const confirmacao = document.getElementById("confirmacao");
const codigoEl = document.getElementById("codigo");

relato.addEventListener("input", () => {
  contador.textContent = relato.value.length + " de 2000";
});

function erro(id, mostrar) {
  const el = document.getElementById(id);
  el.hidden = !mostrar;
  const campo = el.closest(".field");
  if (campo) campo.classList.toggle("invalid", mostrar);
}

function validar() {
  const tipo = form.querySelectorAll('input[name="tipo"]:checked').length > 0;
  const texto = relato.value.trim().length >= 30;
  erro("erro-relato", !texto);
  erro("erro-tipo", !tipo);
  return tipo && texto;
}

// Código de acompanhamento, ex.: RE-7K2M-9QXP (sem caracteres ambíguos)
function gerarCodigo() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const c = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => a[b % a.length]).join("");
  return "RE-" + c.slice(0, 4) + "-" + c.slice(4);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validar()) {
    const primeiro = form.querySelector(".error:not([hidden])");
    if (primeiro) primeiro.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const dados = {
    codigo: gerarCodigo(),
    tipos: Array.from(form.querySelectorAll('input[name="tipo"]:checked')).map((i) => i.value),
    plataforma: form.plataforma.value || "Não informado",
    imagem_no_ar: form.noar.value || "Não sei",
    relato: relato.value.trim(),
    data: new Date().toISOString()
  };

  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;
  botao.textContent = "Enviando...";

  try {
    if (ENDPOINT) {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(dados)
      });
      if (!resp.ok) throw new Error("Falha no envio");
    } else {
      try {
        const lista = JSON.parse(localStorage.getItem("denuncias") || "[]");
        lista.push(dados);
        localStorage.setItem("denuncias", JSON.stringify(lista));
      } catch (_) { /* armazenamento indisponível */ }
    }
  } catch (_) {
    botao.disabled = false;
    botao.textContent = "Enviar denúncia";
    erro("erro-relato", false);
    alert("Não foi possível enviar agora. Verifique sua conexão e tente de novo.");
    return;
  }

  codigoEl.textContent = dados.codigo;
  form.hidden = true;
  confirmacao.hidden = false;
  confirmacao.focus();
  botao.disabled = false;
  botao.textContent = "Enviar denúncia";
});

document.getElementById("copiar").addEventListener("click", async (e) => {
  try {
    await navigator.clipboard.writeText(codigoEl.textContent);
    e.target.textContent = "Código copiado";
  } catch (_) {
    e.target.textContent = "Copie manualmente";
  }
});

document.getElementById("nova").addEventListener("click", () => {
  form.reset();
  contador.textContent = "0 de 2000";
  confirmacao.hidden = true;
  form.hidden = false;
  relato.focus();
});
