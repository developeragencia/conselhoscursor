/**
 * Validação de Dados
 * Valida e sanitiza inputs do usuário
 */

import { Request, Response, NextFunction } from 'express';

// Validar email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar CPF
export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Validar telefone brasileiro
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+55)?(\d{2})?\d{4,5}\d{4}$/;
  return phoneRegex.test(phone.replace(/[^\d+]/g, ''));
}

// Sanitizar string (prevenir XSS)
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Middleware de validação de registro
export function validateRegistration(req: Request, res: Response, next: NextFunction) {
  const { email, password, first_name, last_name, cpf, phone } = req.body;

  const errors: string[] = [];

  if (!email || !validateEmail(email)) {
    errors.push('Email inválido');
  }

  if (!password || password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  if (!first_name || first_name.trim().length < 2) {
    errors.push('Nome inválido');
  }

  if (!last_name || last_name.trim().length < 2) {
    errors.push('Sobrenome inválido');
  }

  if (cpf && !validateCPF(cpf)) {
    errors.push('CPF inválido');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Telefone inválido');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Dados inválidos', details: errors });
  }

  // Sanitizar strings
  req.body.email = req.body.email.toLowerCase().trim();
  req.body.first_name = sanitizeString(req.body.first_name);
  req.body.last_name = sanitizeString(req.body.last_name);

  next();
}

// Validar criação de consulta
export function validateConsultation(req: Request, res: Response, next: NextFunction) {
  const { consultant_id } = req.body;

  if (!consultant_id || typeof consultant_id !== 'string') {
    return res.status(400).json({ error: 'ID do consultor é obrigatório' });
  }

  next();
}

// Validar valores monetários
export function validateAmount(amount: any): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num < 1000000;
}

