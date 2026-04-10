import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";

const API = "https://controle-estoque-api-esmn.onrender.com";

function App() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState("");
  const [logado, setLogado] = useState(false);

  // =========================
  // LISTAR
  // =========================
  const carregarProdutos = () => {
    fetch(`${API}/produtos`)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar produtos");
        return res.json();
      })
      .then(data => setProdutos(data))
      .catch(() => alert("Erro ao buscar produtos"));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // =========================
  // BUSCAR
  // =========================
  const buscarProdutos = () => {
    if (!busca) {
      carregarProdutos();
      return;
    }

    fetch(`${API}/produtos/buscar?nome=${busca}`)
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(() => alert("Erro na busca"));
  };

  // =========================
  // SALVAR
  // =========================
  const salvar = () => {
    fetch(`${API}/produtos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        quantidade: Number(quantidade),
        preco: Number(preco)
      })
    })
      .then(() => {
        limpar();
        carregarProdutos();
      })
      .catch(() => alert("Erro ao salvar"));
  };

  // =========================
  // DELETE
  // =========================
  const deletar = (id) => {
    fetch(`${API}/produtos/${id}`, {
      method: "DELETE"
    })
      .then(() => carregarProdutos())
      .catch(() => alert("Erro ao deletar"));
  };

  // =========================
  // EDITAR
  // =========================
  const prepararEdicao = (produto) => {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setQuantidade(produto.quantidade);
    setPreco(produto.preco);
  };

  // =========================
  // ATUALIZAR
  // =========================
  const atualizar = () => {
    fetch(`${API}/produtos/${editandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        quantidade: Number(quantidade),
        preco: Number(preco)
      })
    })
      .then(() => {
        limpar();
        carregarProdutos();
      })
      .catch(() => alert("Erro ao atualizar"));
  };

  // =========================
  // LIMPAR
  // =========================
  const limpar = () => {
    setNome("");
    setQuantidade("");
    setPreco("");
    setEditandoId(null);
  };

  // =========================
  // LOGIN
  // =========================
  if (!logado) {
    return <Login onLogin={() => setLogado(true)} />;
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="container">
      <h1>Controle de Estoque</h1>

      {/* BUSCA */}
      <div style={{ marginBottom: "15px" }}>
        <input
          placeholder="Buscar produto"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
        />
        <button onClick={buscarProdutos}>Buscar</button>
      </div>

      {/* FORM */}
      <div className="form">
        <input
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <input
          placeholder="Quantidade"
          type="number"
          value={quantidade}
          onChange={e => setQuantidade(e.target.value)}
        />
        <input
          placeholder="Preço"
          type="number"
          value={preco}
          onChange={e => setPreco(e.target.value)}
        />

        {editandoId ? (
          <button className="btn-atualizar" onClick={atualizar}>
            Atualizar
          </button>
        ) : (
          <button className="btn-salvar" onClick={salvar}>
            Salvar
          </button>
        )}

        <button onClick={limpar}>Cancelar</button>
      </div>

      {/* TABELA */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Quantidade</th>
            <th>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nome}</td>
              <td>{p.quantidade}</td>
              <td>R$ {p.preco}</td>
              <td>
                <button
                  className="btn-editar"
                  onClick={() => prepararEdicao(p)}
                >
                  Editar
                </button>

                <button
                  className="btn-deletar"
                  onClick={() => deletar(p.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;