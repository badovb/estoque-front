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
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // =========================
  // LISTAR
  // =========================
  const carregarProdutos = async () => {
    try {
      setLoading(true);
      setErro("");

      const res = await fetch(`${API}/produtos`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setProdutos(data);
    } catch {
      setErro("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (logado) {
      carregarProdutos();
    }
  }, [logado]);

  // =========================
  // BUSCAR
  // =========================
  const buscarProdutos = async () => {
    try {
      setLoading(true);
      setErro("");

      if (!busca) {
        carregarProdutos();
        return;
      }

      const res = await fetch(`${API}/produtos/buscar?nome=${busca}`);
      const data = await res.json();
      setProdutos(data);
    } catch {
      setErro("Erro na busca");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SALVAR / ATUALIZAR
  // =========================
  const salvarOuAtualizar = async () => {
    if (!nome || !quantidade || !preco) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      setErro("");

      const metodo = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API}/produtos/${editandoId}`
        : `${API}/produtos`;

      await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          quantidade: Number(quantidade),
          preco: Number(preco)
        })
      });

      limpar();
      carregarProdutos();
    } catch {
      setErro("Erro ao salvar");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deletar = async (id) => {
    try {
      await fetch(`${API}/produtos/${id}`, {
        method: "DELETE"
      });

      carregarProdutos();
    } catch {
      setErro("Erro ao deletar");
    }
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

      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {loading && <p>Carregando...</p>}

      {/* BUSCA */}
      <div style={{ marginBottom: "15px" }}>
        <input
          placeholder="Buscar produto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
        />
        <button onClick={buscarProdutos}>Buscar</button>
      </div>

      {/* FORM */}
      <div className="form">
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          placeholder="Quantidade"
          type="number"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        <input
          placeholder="Preço"
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <button onClick={salvarOuAtualizar}>
          {editandoId ? "Atualizar" : "Salvar"}
        </button>

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
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nome}</td>
              <td>{p.quantidade}</td>
              <td>R$ {p.preco}</td>
              <td>
                <button onClick={() => prepararEdicao(p)}>Editar</button>
                <button onClick={() => deletar(p.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;