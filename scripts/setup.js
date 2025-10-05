#!/usr/bin/env node

/**
 * Cross-platform setup script for environment files
 * Works on Windows, macOS, and Linux
 * 
 * Usage:
 *   node setup.js           # Setup current project and related projects
 *   node setup.js [dir]     # Setup specific directory
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes (work on most terminals, including Windows 10+)
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

// Fallback for Windows terminals that don't support colors
const isColorSupported = process.platform !== 'win32' || process.env.FORCE_COLOR;
const c = isColorSupported ? colors : {
  green: '', yellow: '', blue: '', red: '', reset: ''
};

console.log('🚀 Setting up Environment Files\n');

// Get project root directory (cross-platform)
const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '..');

/**
 * Parse .env file into key-value pairs
 * @param {string} content - Content of .env file
 * @returns {Object} Key-value pairs
 */
function parseEnv(content) {
  const env = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  }
  
  return env;
}

/**
 * Merge .env.example with existing .env, preserving user values
 * @param {string} exampleContent - Content of .env.example
 * @param {string} existingContent - Content of existing .env
 * @returns {Object} { content: string, extraVars: string[] }
 */
function mergeEnv(exampleContent, existingContent) {
  const existingEnv = parseEnv(existingContent);
  const lines = exampleContent.split('\n');
  const result = [];
  const keysInExample = new Set();
  
  // First pass: merge example with existing values
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Keep comments and empty lines as-is
    if (!trimmed || trimmed.startsWith('#')) {
      result.push(line);
      continue;
    }
    
    // Parse KEY=VALUE from example
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      keysInExample.add(key);
      
      // If key exists in current .env, use that value
      if (existingEnv.hasOwnProperty(key)) {
        result.push(`${key}=${existingEnv[key]}`);
      } else {
        // Otherwise use the example value
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }
  
  // Second pass: find variables in .env that are NOT in .env.example
  const extraVars = [];
  for (const key in existingEnv) {
    if (!keysInExample.has(key)) {
      extraVars.push(key);
      // Add these extra variables at the end
      result.push(`${key}=${existingEnv[key]}`);
    }
  }
  
  // Add a comment section for extra variables if they exist
  if (extraVars.length > 0) {
    result.push('');
    result.push('# ⚠️ Variables below are not in .env.example');
    result.push('# Consider adding them to .env.example if they are important for the project');
  }
  
  return {
    content: result.join('\n'),
    extraVars: extraVars
  };
}

/**
 * Copy or update .env from .env.example
 * @param {string} dir - Directory path (relative or absolute)
 */
function copyEnv(dir) {
  // Always resolve from current working directory for better flexibility
  const fullPath = path.resolve(process.cwd(), dir);
  
  console.log(`${c.blue}Checking: ${dir}${c.reset}`);
  
  // Check if directory exists
  if (!fs.existsSync(fullPath)) {
    console.log(`${c.red}✗${c.reset} Directory ${dir} does not exist`);
    return;
  }
  
  const envExamplePath = path.join(fullPath, '.env.example');
  const envPath = path.join(fullPath, '.env');
  
  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.log(`${c.yellow}⚠${c.reset} ${dir}/.env.example not found`);
    return;
  }
  
  try {
    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    
    if (fs.existsSync(envPath)) {
      // .env exists - merge with existing values
      const existingContent = fs.readFileSync(envPath, 'utf8');
      const merged = mergeEnv(exampleContent, existingContent);
      fs.writeFileSync(envPath, merged.content);
      
      if (merged.extraVars.length > 0) {
        console.log(`${c.green}✓${c.reset} Updated ${dir}/.env (preserved existing values)`);
        console.log(`${c.yellow}  ⚠${c.reset} Found ${merged.extraVars.length} variable(s) not in .env.example: ${merged.extraVars.join(', ')}`);
        console.log(`${c.yellow}  →${c.reset} Consider adding them to ${dir}/.env.example if important for the project`);
      } else {
        console.log(`${c.green}✓${c.reset} Updated ${dir}/.env (preserved existing values)`);
      }
    } else {
      // .env doesn't exist - create new
      fs.copyFileSync(envExamplePath, envPath);
      console.log(`${c.green}✓${c.reset} Created ${dir}/.env`);
    }
  } catch (error) {
    console.log(`${c.red}✗${c.reset} Failed to process ${dir}/.env: ${error.message}`);
  }
}

console.log(`${c.blue}Setting up environment files...${c.reset}\n`);

// Get target directory from command line or use current directory
const targetDir = process.argv[2] || '.';
const dirs = [];

// If a specific directory is provided, use only that
if (process.argv[2]) {
  dirs.push(targetDir);
} else {
  // Otherwise, setup current project and look for related projects
  dirs.push('.');
  
  const relatedProjects = [
    '../rpg-system-api',
    '../rpg-system-core'
  ];
  
  relatedProjects.forEach(project => {
    const projectPath = path.resolve(projectRoot, project);
    if (fs.existsSync(projectPath)) {
      dirs.push(project);
    }
  });
}

// Setup all directories
dirs.forEach(dir => copyEnv(dir));

console.log(`\n${c.green}✓${c.reset} Setup completed!`);
console.log(`\n${c.yellow}📝 Important:${c.reset} Edit the .env files with your actual configuration values.`);
console.log(`${c.yellow}⚠️  Never commit .env files to git!${c.reset}`);
console.log(`${c.yellow}⚠️  Do NOT delete .env.example files - they serve as templates.${c.reset}\n`);
