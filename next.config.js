import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add rule for proto files
    config.module.rules.push({
      test: /\.proto$/,
      type: 'asset/source',
    });

    // Copy proto files to output directory
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CopyProtoFiles', () => {
          const sourceDir = path.join(__dirname, 'src/proto');
          const targetDir = path.join(__dirname, '.next/proto');
          
          // Create target directory if it doesn't exist
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          // Copy files recursively
          fs.cpSync(sourceDir, targetDir, { recursive: true });
        });
      }
    });

    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
};

export default nextConfig; 