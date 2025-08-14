
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth';
import gastosRoutes from './routes/gastos';
import contasFixasRoutes from './routes/contasFixas';
import parcelasRoutes from './routes/parcelas';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env['PORT'] || '5000', 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/contas-fixas', contasFixasRoutes);
app.use('/api/parcelas', parcelasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { prisma };
