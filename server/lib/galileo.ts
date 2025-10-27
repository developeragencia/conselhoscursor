/**
 * Galileo Observability Integration
 * Monitora e registra interações com LLMs
 */

import { init, flush, log } from 'galileo';

// Inicializar Galileo
export async function initGalileo() {
  if (!process.env.GALILEO_API_KEY) {
    console.warn('⚠️ GALILEO_API_KEY não configurada. Observabilidade desativada.');
    return;
  }

  try {
    await init({
      projectName: process.env.GALILEO_PROJECT || 'conselhos-esotericos',
      logStreamName: process.env.GALILEO_LOG_STREAM || 'production',
      apiKey: process.env.GALILEO_API_KEY
    });
    
    console.log('✅ Galileo Observability inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar Galileo:', error);
  }
}

// Finalizar e enviar logs
export async function flushGalileo() {
  try {
    await flush();
  } catch (error) {
    console.error('❌ Erro ao enviar logs Galileo:', error);
  }
}

// Wrapper para funções de workflow
export function logWorkflow<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    return await log(
      {
        name,
        spanType: 'workflow',
        metadata: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        }
      },
      async () => fn(...args)
    );
  }) as T;
}

// Wrapper para funções de tool/ferramenta
export function logTool<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    return await log(
      {
        name,
        spanType: 'tool',
        metadata: {
          timestamp: new Date().toISOString()
        }
      },
      async () => fn(...args)
    );
  }) as T;
}

// Exemplo de uso para integração com OpenAI (se você usar)
/*
import OpenAI from 'openai';
import { wrapOpenAI } from 'galileo';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const openai = wrapOpenAI(client);

// Usar assim:
// const response = await openai.chat.completions.create({...});
*/
