import api  from "../axios";

export async function login(email: string, password: string) {
  try {
    const res = await api.post("/auth/login", { email, password }, { skipAuth: true});
    return res;
  } catch (error) {
    throw new Error("Vazio", { cause: error })
  }
}
