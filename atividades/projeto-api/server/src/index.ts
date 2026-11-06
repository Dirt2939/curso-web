import express from "express";
import errorHandler from './shared/middleware/errorHandler.js';
import { userRouter } from "./modules/user/user.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js"
import cors from "cors";


const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

app.use("/user", userRouter);

app.use("/auth", authRouter)

app.use(errorHandler)

const PORT = 3030
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})
