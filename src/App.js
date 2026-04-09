import { useEffect, useState } from "react";
import "./App.css";
import {
  Container,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from "@mui/material";

function App() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const carregarProdutos = () => {
    fetch("http://localhost:8080/produtos")
      .then(res => res.json())
      .then(data => setProdutos(data));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const salvar = () => {
    fetch("http://localhost:8080/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, quantidade, preco })
    }).then(() => {
      limpar();
      carregarProdutos();
    });
  };

  const deletar = (id) => {
    fetch(`http://localhost:8080/produtos/${id}`, {
      method: "DELETE"
    }).then(() => carregarProdutos());
  };

  const prepararEdicao = (produto) => {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setQuantidade(produto.quantidade);
    setPreco(produto.preco);
  };

  const atualizar = () => {
    fetch(`http://localhost:8080/produtos/${editandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
  <Container>
    <h1>Controle de Estoque</h1>

    <Paper style={{ padding: 20, marginBottom: 20 }}>
      <h2>{editandoId ? "Editar Produto" : "Cadastrar Produto"}</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <TextField label="Nome" value={nome} onChange={e => setNome(e.target.value)} />
        <TextField label="Quantidade" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
        <TextField label="Preço" value={preco} onChange={e => setPreco(e.target.value)} />

        {editandoId ? (
          <Button variant="contained" color="warning" onClick={atualizar}>
            Atualizar
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={salvar}>
            Salvar
          </Button>
        )}

        <Button variant="outlined" onClick={limpar}>
          Cancelar
        </Button>
      </div>
    </Paper>

    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Quantidade</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {produtos.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.nome}</TableCell>
              <TableCell>{p.quantidade}</TableCell>
              <TableCell>{p.preco}</TableCell>
              <TableCell>
                <Button color="primary" onClick={() => prepararEdicao(p)}>
                  Editar
                </Button>
                <Button color="error" onClick={() => deletar(p.id)}>
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  </Container>
);
}

export default App;