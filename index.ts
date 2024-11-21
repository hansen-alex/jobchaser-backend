import express, { Request, Response } from "express"

const app = express();
app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}/`);
})