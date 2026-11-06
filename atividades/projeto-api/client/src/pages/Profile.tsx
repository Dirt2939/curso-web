import { Pencil, UserRound } from "lucide-react";
import CardsProfile from "../components/CardsProfile";
import { useEffect, useState } from "react";
import { getMe } from "../api/User/user.service";
import type User from "../types/User";

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getMe();

        setUser(userData);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar dados do usuário");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center text-primary">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center text-primary">
        <p className="text-danger-light">{error || "Usuário não encontrado"}</p>
      </div>
    );
  }

  const { createdAt, updatedAt, uuid, ...userWithoutDates } = user;
  const userDates = { createdAt, updatedAt };

  void uuid; // Só pra tirar o aviso

  const formateData = (data: string) => {
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(data));

    return dataFormatada;
  };

  return (
    <div className="min-h-screen bg-main px-4 text-primary">
      <header className="flex justify-between p-7">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>

          <p className="text-secondary">Visualize suas informações pessoais</p>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-accent transition-all hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/10">
          <Pencil size={18} />
          Editar Perfil
        </button>
      </header>

      {/* Perfil */}
      <div className="mb-5 p-4 rounded-xl bg-card border border-subtle flex items-center gap-3">
        <UserRound
          size={80}
          className="bg-elevated text-accent rounded-full border-e-subtle size-30"
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl">{userWithoutDates.name}</h1>
          <h2 className="text-secondary">
            Na plataforma desde {formateData(userDates.createdAt)}
          </h2>
          <div className="flex gap-2 items-center">
            <div
              className={`w-4 h-4 rounded-full ${userWithoutDates.isActive ? "bg-success" : "bg-danger-light"}`}
            />
            <p
              className={
                userWithoutDates.isActive ? "text-success" : "text-danger-light"
              }
            >
              Conta {userWithoutDates.isActive ? "ativa" : "desativada"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-subtle bg-card p-6">
        <h2 className="mb-5 text-lg font-semibold text-accent">
          Informações Pessoais
        </h2>

        <CardsProfile user={userWithoutDates} />
      </div>

      <div className="rounded-xl border border-subtle bg-card p-6">
        <h2 className="mb-5 text-lg font-semibold text-accent">
          Informações da Conta
        </h2>

        <CardsProfile user={userDates} />
      </div>
    </div>
  );
}

export default Profile;
