document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("medicamento");
    const resultado = document.getElementById("resultado");

    const API_BASE = "https://backend-hospital-hs2d.onrender.com";

    // Placeholder fixo
    select.innerHTML = '<option value="">— Selecione o medicamento —</option>';

    // 🔹 Carregar todos os medicamentos
    fetch(`${API_BASE}/medicamentos`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao carregar lista");
            }
            return response.json();
        })
        .then(dados => {
            dados.forEach(med => {
                const option = document.createElement("option");
                option.value = med.nome;
                option.textContent = med.nome;
                select.appendChild(option);
            });
        })
        .catch(() => {
            select.innerHTML = '<option>Erro ao carregar medicamentos</option>';
        });

    // 🔹 Consultar disponibilidade
    window.consultar = function () {
        const nome = select.value;

        if (!nome) {
            resultado.textContent = "Por favor, selecione um medicamento.";
            resultado.className = "erro";
            return;
        }

        fetch(`${API_BASE}/medicamentos/${encodeURIComponent(nome)}`)
            .then(response => {
                if (response.status === 404) {
                    throw new Error("Medicamento não encontrado");
                }

                if (!response.ok) {
                    throw new Error("Erro interno do servidor");
                }

                return response.json();
            })
            .then(dado => {
                if (dado.disponivel === true) {
                    resultado.textContent = "✅ MEDICAMENTO DISPONÍVEL";
                    resultado.className = "ok";
                } else {
                    resultado.textContent = "❌ MEDICAMENTO EM FALTA";
                    resultado.className = "erro";
                }
            })
            .catch((erro) => {
                if (erro.message === "Medicamento não encontrado") {
                    resultado.textContent = "Medicamento não encontrado.";
                } else {
                    resultado.textContent = "Erro ao consultar servidor. Aguarde e tente novamente.";
                }
                resultado.className = "erro";
            });
    };
});