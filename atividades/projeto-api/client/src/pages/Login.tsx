import React, { useState, useEffect } from "react";
import { login } from "../api/Auth/auth.service";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || email.trim() === "" || !password || password.trim() === "") {
      // Poupar o banco
      setError(true);
      return;
    }

    try {
      const res = await login(email, password);

      if (res.status != 200) {
        setError(true);
        return;
      }

      localStorage.setItem("token", res.data)

    } catch (error) {
      setError(true);
      console.log(error);
      return;
    }

    navigate("/Profile");
  };

  const handleCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-main px-4">
      <div className="w-full max-w-md bg-card border border-subtle rounded-2xl p-8 shadow-2xl shadow-black/40">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Login</h1>
          <p className="text-secondary mt-2">Entre para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={`${error ? "border-danger-light" : "border-subtle"} w-full px-4 py-3 rounded-xl bg-elevated border text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition`}
            />
          </div>

          <div>
            <input
              type={isChecked ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className={`${error ? "border-danger-light" : "border-subtle"} w-full px-4 py-3 rounded-xl bg-elevated border text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition`}
            />
          </div>

          <label className="flex size-fit items-center justify-start gap-2 text-sm text-secondary select-none hover:cursor-pointer p-1.5">
            <button
              type="button"
              onClick={handleCheckbox}
              className={`w-11 h-6 rounded-full p-1 transition flex items-center ${isChecked ? "bg-accent" : "bg-subtle"} hover:cursor-pointer`}
            >
              <div
                className={`w-4 h-4 bg-primary rounded-full transition-transform ${isChecked ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span>Mostrar senha</span>
          </label>

          {error && (
            <h3 className="text-danger-light text-center">
              Credenciais incorretas.
            </h3>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-accent text-main font-medium hover:bg-accent-hover hover:scale-105 active:scale-[0.98] transition cursor-pointer"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
