#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load production environment variables
dotenv.config({ path: '.env.production' });

async function validateDeployment() {
  console.log('🔍 Starting deployment validation...');
  const errors = [];
  const warnings = [];

  // Check required files
  const requiredFiles = [
    'server/server.tsx',
    'server/database.ts',
    'config/hostinger.ts',
    '.env.production',
    'nginx.conselhos-esotericos.conf',
    'scripts/deploy-hostinger.sh'
  ];

  console.log('\n📁 Checking required files...');
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
      console.log(`✅ ${file} exists`);
    } catch (err) {
      errors.push(`Missing required file: ${file}`);
      console.log(`❌ ${file} is missing`);
    }
  }

  // Validate environment variables
  console.log('\n🔐 Validating environment variables...');
  const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
      console.log(`❌ ${envVar} is missing`);
    } else {
      console.log(`✅ ${envVar} is set`);
    }
  }

  // Test database connection
  console.log('\n🗄️ Testing database connection...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    await connection.query('SELECT 1');
    console.log('✅ Database connection successful');
    await connection.end();
  } catch (err) {
    errors.push(`Database connection failed: ${err.message}`);
    console.log('❌ Database connection failed');
  }

  // Check SSL configuration
  console.log('\n🔒 Checking SSL configuration...');
  const sslConfigured = process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH;
  if (!sslConfigured) {
    warnings.push('SSL certificate paths not configured');
    console.log('⚠️ SSL certificate paths not configured');
  } else {
    console.log('✅ SSL configuration found');
  }

  // Check build configuration
  console.log('\n🏗️ Checking build configuration...');
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    if (!packageJson.scripts.build) {
      warnings.push('No build script found in package.json');
      console.log('⚠️ No build script found in package.json');
    } else {
      console.log('✅ Build script found');
    }
  } catch (err) {
    errors.push('Could not read package.json');
    console.log('❌ Could not read package.json');
  }

  // Summary
  console.log('\n📋 Validation Summary:');
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  if (warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All checks passed! Ready for deployment.');
  } else {
    console.log('\n⚠️ Please fix the above issues before deploying.');
  }
}

validateDeployment().catch(console.error);