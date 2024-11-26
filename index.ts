import express, { Request, Response } from "express"
import { PrismaClient } from "@prisma/client";

const PORT = 3000;
const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// ---| User Routes |--- //

/// Get all users.
app.get("/api/user", async (request: Request, response: Response) => {
    try {
        return response.status(200).send(await prisma.user.findMany());
    } catch (error) {
        return response.status(500).send(error);
    }
});

/// Create a new user.
app.post("/api/user", async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;

        const result = await prisma.user.create({
            data: {
                email,
                password
            }
        });

        return response.status(200).send(result);
    } catch (error) {
        return response.status(500).send(error);
    }
});

/// Delete a user by id.
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

/*TODO: 
* jtw
* validation
* login?
* logout?
*/

/// Get all saved jobs from a user by id.
app.get("/api/user/:id/saved-jobs", async (request: Request, response: Response) => {
    try {
        const id = Number.parseInt(request.params.id);
        if(!id) return response.status(400).send({ message: "ID parameter is NaN." });

        return response.status(200).send(await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                savedJobs: true
            }
        }));
    } catch (error) {
        return response.status(500).send(error);
    }
});

/// Save a job by jobId to a user by id.
app.put("/api/user/:id/save-job/:jobId", async (request: Request, response: Response) => {
    try {
        const id = Number.parseInt(request.params.id);
        if(!id) return response.status(400).send({ message: "ID parameter is NaN." });
        const jobId = Number.parseInt(request.params.jobId);
        if(!jobId) return response.status(400).send({ message: "Job ID parameter is NaN." });

        const result = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                savedJobs: {
                    connect: {
                        id: jobId
                    }
                }
            }
        });

        return response.status(200).send(result);
    } catch (error) {
        return response.status(500).send(error);
    }
});

/// Remove a saved job by jobId to a user by id.
app.put("/api/user/:id/unsave-job/:jobId", async (request: Request, response: Response) => {
    try {
        const id = Number.parseInt(request.params.id);
        if(!id) return response.status(400).send({ message: "ID parameter is NaN." });
        const jobId = Number.parseInt(request.params.jobId);
        if(!jobId) return response.status(400).send({ message: "Job ID parameter is NaN." });

        const result = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                savedJobs: {
                    disconnect: {
                        id: jobId
                    }
                }
            }
        });

        return response.status(200).send(result);
    } catch (error) {
        return response.status(500).send(error);
    }
});

// ---| Job Routes |--- //

/// Get all jobs.
app.get("/api/job", async (request: Request, response: Response) => {
    try {
        return response.status(200).send(await prisma.job.findMany());
    } catch (error) {
        return response.status(500).send(error);
    }
});

/// Create a new job.
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

/// Delete a job by id.
app.delete("/api/job/:id", async (request: Request, response: Response) => {
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