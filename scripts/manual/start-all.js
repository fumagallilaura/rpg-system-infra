#!/usr/bin/env node

/**
 * Script para iniciar todos os serviços manualmente (sem Docker)
 * Útil para máquinas com poucos recursos ou desenvolvimento local
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const c = colors;

console.log('🚀 Iniciando RPG System (modo manual)\n');

const scriptDir = __dirname;
const infraDir = path.resolve(scriptDir, '../..');
const setupScript = path.join(infraDir, 'scripts/setup.js');

// Função para executar o setup
function runSetup(dir) {
  return new Promise((resolve, reject) => {
    const targetPath = path.resolve(infraDir, dir);
    const projectName = path.basename(targetPath);
    
    console.log(`${c.blue}→${c.reset} Configurando ${projectName}...`);
    
    if (!fs.existsSync(targetPath)) {
      console.log(`${c.yellow}⚠${c.reset} ${projectName} não encontrado, pulando...\n`);
      resolve();
      return;
    }
    
    const setup = spawn('node', [setupScript, dir], {
      cwd: infraDir,
      stdio: 'inherit'
    });
    
    setup.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.log(`${c.yellow}⚠${c.reset} Erro ao configurar ${projectName}\n`);
        resolve(); // Continua mesmo com erro
      }
    });
  });
}

// Função para iniciar um serviço
function startService(name, command, cwd) {
  console.log(`${c.cyan}→${c.reset} Iniciando ${name}...`);
  
  const [cmd, ...args] = command.split(' ');
  const service = spawn(cmd, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: true
  });
  
  service.on('error', (err) => {
    console.log(`${c.red}✗${c.reset} Erro ao iniciar ${name}: ${err.message}`);
  });
  
  return service;
}

async function main() {
  // 1. Setup de todos os projetos
  console.log(`${c.blue}━━━ Fase 1: Setup de Ambiente ━━━${c.reset}\n`);
  
  await runSetup('.');
  await runSetup('../rpg-system-api');
  await runSetup('../rpg-system-core');
  
  console.log(`\n${c.green}✓${c.reset} Setup completo!\n`);
  
  // 2. Verificar se os serviços existem
  console.log(`${c.blue}━━━ Fase 2: Iniciando Serviços ━━━${c.reset}\n`);
  
  const apiPath = path.resolve(infraDir, '../rpg-system-api');
  
  if (!fs.existsSync(apiPath)) {
    console.log(`${c.red}✗${c.reset} rpg-system-api não encontrado em ${apiPath}`);
    console.log(`${c.yellow}→${c.reset} Clone o repositório e tente novamente\n`);
    process.exit(1);
  }
  
  // 3. Instruções para serviços externos
  console.log(`${c.yellow}📝 Serviços que precisam estar rodando:${c.reset}`);
  console.log(`   • PostgreSQL (porta 5432)`);
  console.log(`   • Redis (porta 6379) - opcional`);
  console.log(`   • Kafka (porta 9092) - opcional`);
  console.log(``);
  console.log(`${c.cyan}💡 Dica:${c.reset} Use Docker apenas para esses serviços:`);
  console.log(`   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=admin postgres:15-alpine`);
  console.log(``);
  
  // 4. Iniciar API
  console.log(`${c.green}→${c.reset} Iniciando rpg-system-api...\n`);
  
  const api = startService('rpg-system-api', 'npm run start:dev', apiPath);
  
  // Capturar sinais de término
  process.on('SIGINT', () => {
    console.log(`\n\n${c.yellow}→${c.reset} Parando serviços...`);
    api.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    api.kill();
    process.exit(0);
  });
}

main().catch(err => {
  console.error(`${c.red}✗${c.reset} Erro: ${err.message}`);
  process.exit(1);
});
