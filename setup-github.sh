#!/bin/bash

# Responsive Race Display - GitHub Repository Setup Script
# This script initializes a new GitHub repository with all the necessary files

set -e  # Exit on any error

echo "🚀 Setting up Responsive Race Display GitHub Repository"
echo "========================================================"

# Navigate to the project directory
cd "$(dirname "$0")"

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "📁 Git repository already exists"
fi

# Add all files to git
echo "📝 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "🎉 Initial commit: Responsive Race Display System v1.0.0

Features:
- 🎯 Comprehensive responsive scaling system
- 📐 Precise positioning with drag-and-drop
- 🎨 Enhanced GrapesJS integration  
- 🏃 Production-ready display components
- 🛠️ Complete development environment

Components:
- RunnerDisplayEnhanced: Smart responsive display
- ResponsiveTemplateViewer: Standalone viewer
- useGrapesEditor: Enhanced editor hook
- Comprehensive CSS framework with responsive variables

Technical:
- React 18+ compatibility
- TypeScript-ready
- Vite build system
- Modern CSS with clamp() and viewport units
- Intelligent text fitting for long names"

echo "✅ Initial commit created"

# Instructions for GitHub setup
echo ""
echo "🌐 Next Steps for GitHub Setup:"
echo "================================"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: responsive-race-display"
echo "   - Description: A comprehensive responsive display system for race timing applications"
echo "   - Make it Public (recommended for open source)"
echo "   - Don't initialize with README (we have our own)"
echo ""
echo "2. Connect your local repository to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/responsive-race-display.git"
echo ""
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Optional - Add collaborators:"
echo "   - Go to Settings > Manage access on your GitHub repo"
echo "   - Click 'Invite a collaborator'"
echo ""
echo "5. Set up GitHub Pages (optional):"
echo "   - Go to Settings > Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main / docs"
echo ""
echo "🎯 Repository Structure Created:"
echo "==============================="
echo "📦 responsive-race-display/"
echo "├── 📄 README.md              # Comprehensive documentation"
echo "├── 📄 package.json           # NPM package configuration"
echo "├── 📄 LICENSE                # MIT License"
echo "├── 📄 CHANGELOG.md           # Version history"
echo "├── 📄 .gitignore             # Git ignore rules"
echo "├── 📄 vite.config.js         # Vite configuration"
echo "├── 📄 index.html             # Demo page entry"
echo "├── 📁 src/                   # Source code"
echo "│   ├── 📄 index.js           # Main exports"
echo "│   ├── 📄 demo.jsx           # Interactive demo"
echo "│   ├── 📁 components/        # React components"
echo "│   ├── 📁 utils/             # Utility functions"
echo "│   ├── 📁 hooks/             # React hooks"
echo "│   └── 📁 styles/            # CSS styles"
echo "├── 📁 docs/                  # Documentation"
echo "│   ├── 📄 API.md             # API reference"
echo "│   └── 📄 EXAMPLES.md        # Usage examples"
echo "└── 📄 setup-github.sh        # This setup script"
echo ""
echo "✨ Ready for GitHub! Follow the steps above to publish your repository."
echo ""

# Development setup instructions
echo "🛠️  Local Development Setup:"
echo "============================"
echo ""
echo "To start developing locally:"
echo "  npm install                 # Install dependencies"
echo "  npm run dev                 # Start development server"
echo "  npm run build               # Build for production"
echo "  npm test                    # Run tests"
echo ""
echo "🎨 Demo Features:"
echo "================"
echo "- Interactive runner display with responsive scaling"
echo "- Template viewer with orientation controls"
echo "- Template builder with GrapesJS integration"
echo "- Live text fitting demonstration"
echo "- Responsive layout examples"
echo ""
echo "🔗 Useful Links After GitHub Setup:"
echo "==================================="
echo "- Repository: https://github.com/YOUR_USERNAME/responsive-race-display"
echo "- Issues: https://github.com/YOUR_USERNAME/responsive-race-display/issues"
echo "- Pull Requests: https://github.com/YOUR_USERNAME/responsive-race-display/pulls"
echo "- Releases: https://github.com/YOUR_USERNAME/responsive-race-display/releases"
echo ""
echo "Happy coding! 🚀"