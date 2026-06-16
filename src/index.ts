import { app } from "./app.js";

const puerto = Number(process.env.PORT ?? 4000);

app.listen(puerto, () => {
  console.log(`Servidor de TalentTrade escuchando en http://localhost:${puerto}`);
});
