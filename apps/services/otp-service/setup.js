const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create .env file with default environment variables
const envContent = `# OTP Service Environment Variables
NODE_ENV=development
PORT=3008
DB_HOST=localhost
DB_PORT=5432
DB_NAME=otp_service
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
SMS_SERVICE_API_KEY=your-sms-api-key
EMAIL_SERVICE_API_KEY=your-email-api-key
OTP_ENCRYPTION_KEY=32_character_encryption_key_here
`;

fs.writeFileSync(path.join(__dirname, 'config', '.env'), envContent);
console.log('✓ Environment variables file created at config/.env');

// Initialize package.json if it doesn't exist
if (!fs.existsSync('package.json')) {
  const packageJson = {
    name: 'otp-service',
    version: '1.0.0',
    description: 'OTP service for one-time password generation and validation',
    main: 'src/server.js',
    scripts: {
      start: 'node src/server.js',
      dev: 'nodemon src/server.js',
      test: 'jest',
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix'
    },
    keywords: ['otp', 'authentication', 'verification', 'security', 'social-platform'],
    author: 'Social Platform Team',
    license: 'MIT',
    dependencies: {
      'express': '^4.18.0',
      'cors': '^2.8.5',
      'helmet': '^7.0.0',
      'express-rate-limit': '^6.8.0',
      'joi': '^17.9.0',
      'dotenv': '^16.3.0',
      'mongoose': '^7.4.0',
      'redis': '^4.6.0',
      'twilio': '^4.19.0',
      'nodemailer': '^6.9.4',
      'speakeasy': '^2.0.0',
      'qrcode': '^1.5.3',
      'crypto': '^1.0.1'
    },
    devDependencies: {
      'nodemon': '^3.0.0',
      'jest': '^29.6.0',
      'supertest': '^6.3.0',
      'eslint': '^8.45.0'
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✓ package.json created');
}

// Create a basic .eslintrc.js file
const eslintConfig = `module.exports = {
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
  },
};
`;

fs.writeFileSync('.eslintrc.js', eslintConfig);
console.log('✓ ESLint configuration created');

// Create a basic .gitignore file
const gitignoreContent = `# Dependencies
node_modules/

# Environment variables
.env

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed

# Coverage directory used by jest
coverage/

# Production build
dist/

# IDE files
.vscode/
.idea/
`;

fs.writeFileSync('.gitignore', gitignoreContent);
console.log('✓ .gitignore file created');

console.log('\\n✓ OTP Service setup completed!');
console.log('\\nTo start the service:');
console.log('1. Update config/.env with your environment variables');
console.log('2. Run: npm install');
console.log('3. Run: npm run dev');