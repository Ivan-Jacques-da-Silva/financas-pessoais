import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import type { Request, Response } from 'express';

const router = express.Router();

// Registrar usuário
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    // Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado }
    });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(String(senha), 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: String(nome).trim(),
        email: emailNormalizado,
        senha: senhaHash
      },
      select: { id: true, nome: true, email: true } // não retorna a senha
    });

    // Gerar token JWT
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      process.env['JWT_SECRET'] || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: usuario,
      token
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    // Buscar usuário (pega só o necessário)
    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: { id: true, nome: true, email: true, senha: true }
    });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(String(senha), usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      process.env['JWT_SECRET'] || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remover senha do retorno
    const { senha: _omit, ...userPublico } = usuario;

    return res.json({
      message: 'Login realizado com sucesso',
      user: userPublico,
      token
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
