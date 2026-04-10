import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import "./App.css";
import Login from "./Login";

/** Base da API sem barra final; aceita env com ou sem `/produtos` no fim. */
function normalizeApiBase(url) {
  const fallback = "http://localhost:8080";
  if (!url || typeof url !== "string") return fallback;
  let u = url.trim().replace(/\/+$/, "");
  if (u.endsWith("/produtos")) {
    u = u.slice(0, -"/produtos".length);
  }
  return u || fallback;
}

const API = normalizeApiBase(process.env.REACT_APP_API_URL);

function App() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [buscaId, setBuscaId] = useState("");
  const [buscaNome, setBuscaNome] = useState("");
  const [logado, setLogado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [formAberto, setFormAberto] = useState(false);

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
    const idStr = buscaId.trim();
    const nomeStr = buscaNome.trim();

    if (!idStr && !nomeStr) {
      carregarProdutos();
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const idNum = idStr ? parseInt(idStr, 10) : NaN;
      const idValid = idStr !== "" && !Number.isNaN(idNum);

      // Só por ID
      if (idValid && !nomeStr) {
        const res = await fetch(`${API}/produtos/${idNum}`);
        if (res.status === 404) {
          setProdutos([]);
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProdutos(Array.isArray(data) ? data : [data]);
        return;
      }

      // Só por nome (ou nome + ID inválido no campo — usa só o nome)
      if (nomeStr && (!idStr || !idValid)) {
        const res = await fetch(
          `${API}/produtos/buscar?nome=${encodeURIComponent(nomeStr)}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProdutos(list);
        return;
      }

      // ID + nome: busca por nome e filtra pelo ID
      if (idValid && nomeStr) {
        const res = await fetch(
          `${API}/produtos/buscar?nome=${encodeURIComponent(nomeStr)}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProdutos(list.filter((p) => p.id === idNum));
        return;
      }

      if (idStr && !idValid) {
        setErro("ID inválido");
      }
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
      setLoading(true);

      const metodo = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API}/produtos/${editandoId}`
        : `${API}/produtos`;

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          quantidade: Number(quantidade),
          preco: Number(preco)
        })
      });

      if (!res.ok) {
        let detalhe = "";
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json();
            detalhe =
              data?.message ||
              data?.error ||
              data?.details ||
              JSON.stringify(data);
          } else {
            detalhe = await res.text();
          }
        } catch {
          // ignore parse errors
        }

        throw new Error(
          `Falha ao salvar (${res.status})${detalhe ? `: ${detalhe}` : ""}`
        );
      }

      fecharFormulario();
      carregarProdutos();
    } catch (e) {
      setErro(e?.message || "Erro ao salvar");
    } finally {
      setLoading(false);
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
    setErro("");
    setEditandoId(produto.id);
    setNome(produto.nome);
    setQuantidade(produto.quantidade);
    setPreco(produto.preco);
    setFormAberto(true);
  };

  const abrirAdicionar = () => {
    setErro("");
    setNome("");
    setQuantidade("");
    setPreco("");
    setEditandoId(null);
    setFormAberto(true);
  };

  const fecharFormulario = () => {
    setNome("");
    setQuantidade("");
    setPreco("");
    setEditandoId(null);
    setFormAberto(false);
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

      {/* BUSCA + ADICIONAR */}
      <div
        className="toolbar-busca"
        style={{
          marginBottom: "15px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center"
        }}
      >
        <input
          placeholder="Filtrar por ID"
          type="number"
          min={0}
          value={buscaId}
          onChange={(e) => setBuscaId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
        />
        <input
          placeholder="Filtrar por nome"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
        />
        <button type="button" onClick={buscarProdutos}>
          Buscar
        </button>
        <button
          type="button"
          className="btn-adicionar"
          onClick={abrirAdicionar}
          style={{ marginLeft: "auto" }}
        >
          Adicionar produto
        </button>
      </div>

      <Dialog
        open={formAberto}
        onClose={fecharFormulario}
        maxWidth="xs"
        fullWidth
        aria-labelledby="form-produto-titulo"
      >
        <DialogTitle id="form-produto-titulo">
          {editandoId ? "Editar produto" : "Novo produto"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Quantidade"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              fullWidth
            />
            <TextField
              label="Preço"
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={fecharFormulario}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="contained"
            color={editandoId ? "warning" : "success"}
            onClick={salvarOuAtualizar}
          >
            {editandoId ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

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