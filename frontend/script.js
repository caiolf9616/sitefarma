document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("medicamento");
    const resultado = document.getElementById("resultado");

    // Placeholder fixo
    select.innerHTML = '<option value="">— Selecione o medicamento —</option>';

    // Carregar todos os medicamentos
    fetch("https://backend-hospital-hs2d.onrender.com/medicamentos")
        .then(response => response.json())
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

    // Consultar disponibilidade
    window.consultar = function () {
        const nome = select.value;

        if (!nome) {
            resultado.textContent = "Por favor, selecione um medicamento.";
            resultado.className = "erro";
            return;
        }

        fetch(`https://backend-hospital-hs2d.onrender.com/medicamentos/${nome}`)

            .then(response => response.json())
            .then(dado => {
                if (dado.disponivel) {
                    resultado.textContent = "✅ MEDICAMENTO DISPONÍVEL";
                    resultado.className = "ok";
                } else {
                    resultado.textContent = "❌ MEDICAMENTO EM FALTA";
                    resultado.className = "erro";
                }
            })
            .catch(() => {
                resultado.textContent = "Erro ao consultar.";
                resultado.className = "erro";
            });
    };
});
