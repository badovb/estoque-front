import { useEffect, useState } from "react";
import "./App.css";

const API = "https://controle-estoque-api-esmn.onrender.com";

function App() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState("");

  // LISTAR
  const carregarProdutos = () => {
    fetch(`${API}/produtos`)
      .then(res => res.json())
      .then(data => setProdutos(data));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // BUSCAR
  const buscarProdutos = () => {
    fetch(`${API}/produtos/buscar?nome=${busca}`)
      .then(res => res.json())
      .then(data => setProdutos(data));
  };

  // SALVAR
  const salvar = () => {
    fetch(`${API}/produtos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, quantidade, preco })
    }).then(() => {
      limpar();
      carregarProdutos();
    });
  };

  // DELETE
  const deletar = (id) => {
    fetch(`${API}/produtos/${id}`, {
      method: "DELETE"
    }).then(() => carregarProdutos());
  };

  // EDITAR
  const prepararEdicao = (produto) => {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setQuantidade(produto.quantidade);
    setPreco(produto.preco);
  };

  const atualizar = () => {
    fetch(`${API}/produtos/${editandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, quantidade, preco })
    }).then(() => {
      limpar();
      carregarProdutos();
    });
  };

  const limpar = () => {
    setNome("");
    setQuantidade("");
    setPreco("");
    setEditandoId(null);
  };

  return (
  <div className="container">
    <h1>Controle de Estoque</h1>

    <input
  placeholder="Buscar produto"
  value={busca}
  onChange={e => setBusca(e.target.value)}
/>

<button onClick={buscarProdutos}>Buscar</button>

    <div className="form">
      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
      <input placeholder="Quantidade" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
      <input placeholder="Preço" value={preco} onChange={e => setPreco(e.target.value)} />

      {editandoId ? (
        <button className="btn-atualizar" onClick={atualizar}>Atualizar</button>
      ) : (
        <button className="btn-salvar" onClick={salvar}>Salvar</button>
      )}

      <button onClick={limpar}>Cancelar</button>
    </div>

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
            <td>{p.preco}</td>
            <td>
              <button className="btn-editar" onClick={() => prepararEdicao(p)}>Editar</button>
              <button className="btn-deletar" onClick={() => deletar(p.id)}>Excluir</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}

export default App;