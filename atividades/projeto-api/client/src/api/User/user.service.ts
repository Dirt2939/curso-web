import api from "../axios";

export const getMe = async () => {
  try {
    const res = await api.post("/user/me");
    return res.data;
  } catch (error) {
    throw new Error("Erro ao buscar dados do usuário", { cause: error });
  }
};
