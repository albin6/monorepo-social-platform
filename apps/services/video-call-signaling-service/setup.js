const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create .env file with default environment variables
const envContent = `# Video Call Signaling Service Environment Variables
NODE_ENV=development
PORT=3007
DB_HOST=localhost
DB_PORT=5432
DB_NAME=video_call_signaling_service
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
STUN_SERVER=stun:stun.l.google.com:19302
TURN_SERVER=turn:your-turn-server.com:3478
TURN_USERNAME=your-turn-username
TURN_PASSWORD=your-turn-password
`;

fs.writeFileSync(path.join(__dirname, 'config', '.env'), envContent);
console.log('✓ Environment variables file created at config/.env');

// Initialize package.json if it doesn't exist
if (!fs.existsSync('package.json')) {
  const packageJson = {
    name: 'video-call-signaling-service',
    version: '1.0.0',
    description: 'Video call signaling service using WebRTC',
    main: 'src/server.js',
    scripts: {
      start: 'node src/server.js',
      dev: 'nodemon src/server.js',
      test: 'jest',
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix'
    },
    keywords: ['video', 'call', 'webrtc', 'signaling', 'social-platform'],
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
      'socket.io': '^4.7.0',
      'socket.io-redis': '^6.1.1'
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

console.log('\\n✓ Video Call Signaling Service setup completed!');
console.log('\\nTo start the service:');
console.log('1. Update config/.env with your environment variables');
console.log('2. Run: npm install');
console.log('3. Run: npm run dev');