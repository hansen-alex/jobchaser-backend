import express, { NextFunction, request, Request, response, Response } from "express"
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt"

const PORT = 3000;
const app = express();
app.use(express.json());

const prisma = new PrismaClient();

interface JWTRequest extends Request {
    user?: JwtPayload;
}

// ---| Middleware |--- //

/// JWT Authorization middleware
const JWTAuth = (request: JWTRequest, response: Response, next: NextFunction) => {
    try {
        const token = request.headers.authorization?.split(" ")[1]; //Removes "Bearer " from string.
        if(!token) return response.status(401).send({ message: "Invalid token." });

        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET) return response.status(500).send({ message: "Internal server error." });

        jwt.verify(token, JWT_SECRET, (error, decoded) => {
            if(error) {
                if(error.name == "JsonWebTokenError") return response.status(401).send({ message: "Invalid token." });
                if(error.name == "TokenExpiredError") return response.status(401).send({ message: "Token expired." });
                throw error;
            }
            else {
                request.user = decoded as JwtPayload;
                next();
            }
        });

    } catch (error) {
        response.status(500).send(error);
    }
};

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
        
        if(!email) return response.status(400).send({ message: "No email supplied." });
        if(!password) return response.status(400).send({ message: "No password supplied." });
        if(await prisma.user.findUnique({
            where: {
                email: email
            }
        })) return response.status(400).send({ message: "Email already in use." });
        
        const encryptedPassword = await bcrypt.hash(password, 10);        
        const result = await prisma.user.create({
            data: {
                email: email,
                password: encryptedPassword
            }
        });

        return response.status(200).send(result);
    } catch (error) {
        return response.status(500).send(error);
    }
});

/// Verify user credentials and return JWT if success.
app.post("/api/user/login", async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;

        if(!email) return response.status(400).send({ message: "No email supplied." });
        if(!password) return response.status(400).send({ message: "No password supplied." });

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        
        if(!user) return response.status(400).send({ message: "Email and password do not match." });
        if(!await bcrypt.compare(password, user.password)) return response.status(400).send({ message: "Email and password do not match." });

        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET) return response.status(500).send({ message: "Internal server error." });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 3600 });
        
        return response.status(200).send({ message: "Login successful.", token: token });
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

/// Get all saved jobs from a user by JWT.
app.get("/api/user/saved-jobs", JWTAuth, async (request: JWTRequest, response: Response) => {
    try {
        const id = Number.parseInt(request.user?.id);
        if(!id) return response.status(400).send({ message: "Invalid user ID." });

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

/// Save a job by jobId to a user by JWT.
app.put("/api/user/save-job/:jobId", JWTAuth, async (request: JWTRequest, response: Response) => {
    try {
        const id = Number.parseInt(request.user?.id);
        if(!id) return response.status(400).send({ message: "Invalid user ID." });
        const jobId = Number.parseInt(request.params.jobId);
        if(!jobId) return response.status(400).send({ message: "Job ID parameter is NaN." });

        /*const result =*/ await prisma.user.update({
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

        return response.status(200).send();
    } catch (error) {
        return response.status(500).send(error);
    }
});

/// Remove a saved job by jobId to a user by JWT.
app.put("/api/user/unsave-job/:jobId", JWTAuth, async (request: JWTRequest, response: Response) => {
    try {
        const id = Number.parseInt(request.user?.id);
        if(!id) return response.status(400).send({ message: "Invalid user ID." });
        const jobId = Number.parseInt(request.params.jobId);
        if(!jobId) return response.status(400).send({ message: "Job ID parameter is NaN." });

        /*const result =*/ await prisma.user.update({
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

        return response.status(200).send();
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

        if(!company) return response.status(400).send({ message: "No company supplied." });
        if(!logo) return response.status(400).send({ message: "No logo supplied." });
        if(!position) return response.status(400).send({ message: "No position supplied." });
        if(!role) return response.status(400).send({ message: "No role supplied." });
        if(!level) return response.status(400).send({ message: "No level supplied." });
        if(!postedAt) return response.status(400).send({ message: "No postedAt supplied." });
        if(!contract) return response.status(400).send({ message: "No contract supplied." });
        if(!location) return response.status(400).send({ message: "No location supplied." });

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