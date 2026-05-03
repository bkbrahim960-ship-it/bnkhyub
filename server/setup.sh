#!/bin/bash

echo "🚀 Starting BNKhub Free AI Subtitle Setup..."

# 1. Install Ollama (Linux/WSL)
if ! command -v ollama &> /dev/null
then
    echo "📥 Ollama not found. Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama is already installed."
fi

# 2. Pull the Arabic-specialized model
echo "🧠 Pulling Aya Expanse 8B (Optimized for Arabic)..."
ollama pull aya-expanse:8b

# 3. Pull fallback models
echo "🧠 Pulling Command-R (Good for long context)..."
ollama pull command-r

echo "✅ AI Models are ready!"

# 4. Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# 5. Initialize SQLite Database
echo "🗄️ Initializing SQLite Database..."
npx prisma db push

echo "🎉 Setup Complete! Run 'npm run dev' to start the server."
