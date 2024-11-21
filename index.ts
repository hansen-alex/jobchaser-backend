import express, { Request, Response } from "express"
import { PrismaClient } from "@prisma/client";

const PORT = 3000;
const app = express();
app.use(express.json());

const prisma = new PrismaClient();

//jtw, login? logout?

app.get("/api/user", async (request: Request, response: Response) => {
    try {
        return response.status(200).send(await prisma.user.findMany());
    } catch (error) {
        return response.status(500).send(error);
    }
});

app.post("/api/user", async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;

        const result = await prisma.user.create({
            data: {
                email,
                password,
            }
        });

        return response.status(200).send(result);
    } catch (error) {
        return response.status(500).send(error);
    }
});

app.delete("/api/user/:id", async (request: Request, response: Response) => {
    try {
        const id = Number.parseInt(request.params.id);
        if(!id) return response.status(400).send({ message: "ID parameter is NaN." });

        return response.status(200).send(await prisma.user.delete({
            where: {
                id: id
            }
        }));
    } catch (error) {
        return response.status(500).send(error);
    }
});

// app.get("/api/user/:id/saved-jobs", async (request: Request, response: Response) => {
//     try {
//         return response.status(200).send({ message: "Yo" });
//     } catch (error) {
//         return response.status(500).send(error);
//     }
// });

// app.put("/api/user/:id/save-job", async (request: Request, response: Response) => {
//     try {
//         return response.status(200).send({ message: "Yo" });
//     } catch (error) {
//         return response.status(500).send(error);
//     }
// });

// app.put("/api/user/:id/unsave-job", async (request: Request, response: Response) => {
//     try {
//         return response.status(200).send({ message: "Yo" });
//     } catch (error) {
//         return response.status(500).send(error);
//     }
// });

app.get("/api/job", async (request: Request, response: Response) => {
    try {
        return response.status(200).send(await prisma.job.findMany());
    } catch (error) {
        return response.status(500).send(error);
    }
});

app.post("/api/job", async (request: Request, response: Response) => {
    try {
        const { company, logo, position, role, level, postedAt, contract, location, languages, tools } = request.body;

        const result = await prisma.job.create({
            data: {
                company,
                logo,
                position,
                role,
                level,
                postedAt,
                contract,
                location,
                languages,
                tools
            }
        });

        return response.status(200).send(result);
    } catch (error) {
        return response.status(500).send(error);
    }
});

app.get("/api/job/:id", async (request: Request, response: Response) => {
    try {
        const id = Number.parseInt(request.params.id);
        if(!id) return response.status(400).send({ message: "ID parameter is NaN." });

        return response.status(200).send(await prisma.job.delete({
            where: {
                id: id
            }
        }));
    } catch (error) {
        return response.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}/`);
})