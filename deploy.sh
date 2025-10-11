#!/bin/bash

# FitFuel AI Guide - Deployment Script
# This script helps deploy the application to various platforms

set -e  # Exit on any error

echo "🚀 FitFuel AI Guide Deployment Script"
echo "======================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to build the application
build_app() {
    echo "📦 Building the application..."
    
    if command_exists bun; then
        echo "Using Bun for building..."
        bun run build
    elif command_exists npm; then
        echo "Using npm for building..."
        npm run build
    else
        echo "❌ No package manager found. Please install Node.js/npm or Bun."
        exit 1
    fi
    
    echo "✅ Build completed successfully!"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🌐 Deploying to Netlify..."
    
    if ! command_exists netlify; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    build_app
    
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    echo "✅ Deployment to Netlify completed!"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "▲ Deploying to Vercel..."
    
    if ! command_exists vercel; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    build_app
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Deployment to Vercel completed!"
}

# Function to deploy to Firebase Hosting
deploy_firebase() {
    echo "🔥 Deploying to Firebase Hosting..."
    
    if ! command_exists firebase; then
        echo "📦 Installing Firebase CLI..."
        npm install -g firebase-tools
    fi
    
    build_app
    
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    echo "✅ Deployment to Firebase Hosting completed!"
}

# Function to build Docker image
build_docker() {
    echo "🐳 Building Docker image..."
    
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    echo "📦 Building Docker image..."
    docker build -t fitfuel-ai-guide .
    
    echo "✅ Docker image built successfully!"
    echo "To run: docker run -p 3000:80 fitfuel-ai-guide"
}

# Function to validate environment
validate_env() {
    echo "🔍 Validating environment..."
    
    if [ ! -f ".env.local" ]; then
        echo "⚠️  Warning: .env.local file not found."
        echo "   Please copy .env.template to .env.local and configure your variables."
        echo "   This is required for proper functionality."
        echo ""
    fi
    
    # Check if essential files exist
    required_files=("package.json" "index.html" "src/main.tsx")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Required file missing: $file"
            exit 1
        fi
    done
    
    echo "✅ Environment validation passed!"
}

# Function to show help
show_help() {
    echo "Usage: ./deploy.sh [PLATFORM]"
    echo ""
    echo "Available platforms:"
    echo "  netlify   - Deploy to Netlify"
    echo "  vercel    - Deploy to Vercel"
    echo "  firebase  - Deploy to Firebase Hosting"
    echo "  docker    - Build Docker image"
    echo "  build     - Build application only"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh netlify"
    echo "  ./deploy.sh build"
    echo "  ./deploy.sh docker"
    echo ""
    echo "Note: Make sure to configure your .env.local file before deployment."
}

# Main deployment logic
main() {
    # Validate environment first
    validate_env
    
    case "${1:-help}" in
        "netlify")
            deploy_netlify
            ;;
        "vercel")
            deploy_vercel
            ;;
        "firebase")
            deploy_firebase
            ;;
        "docker")
            build_docker
            ;;
        "build")
            build_app
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            echo "❌ Unknown platform: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"