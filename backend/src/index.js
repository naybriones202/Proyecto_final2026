import express from "express";
import path from "path";

const app = express();
const __dirname = path.resolve();

// 👉 AQUÍ ESTABA TU ERROR
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(10000, () => {
  console.log("Servidor activo en puerto 10000");
});


