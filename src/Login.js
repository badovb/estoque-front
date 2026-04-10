import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const logar = () => {
    if (email === "admin" && senha === "123") {
      onLogin();
    } else {
      alert("Login inválido");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login do Sistema</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
      />
      <br /><br />

      <button onClick={logar}>Entrar</button>
    </div>
  );
}

export default Login;