# 🤝 Contributing to FitFuel

Thank you for your interest in contributing to FitFuel! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

We welcome contributions in many forms:
- 🐛 **Bug Reports**: Found a bug? Let us know!
- 💡 **Feature Requests**: Have an idea? We'd love to hear it!
- 📖 **Documentation**: Help improve our docs
- 🎨 **UI/UX Improvements**: Make the app more beautiful and user-friendly
- 🔧 **Code Contributions**: Fix bugs or add new features
- 🧪 **Testing**: Help us improve test coverage
- 🌍 **Translations**: Help make FitFuel accessible globally

## 🚀 Getting Started

### 1. Fork the Repository
Click the "Fork" button at the top of the repository page.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/FitFuel.git
cd FitFuel
```

### 3. Set Up Development Environment
```bash
# Install dependencies
npm install  # or bun install

# Copy environment template
cp .env.template .env.local

# Fill in your development configuration
# See DEPLOYMENT.md for detailed setup instructions
```

### 4. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## 🛠️ Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Style
We use ESLint and Prettier for consistent code formatting:
```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing
- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage

## 📝 Pull Request Process

### 1. Before Submitting
- [ ] Code follows project style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated if needed
- [ ] No console errors or warnings
- [ ] AI features work with fallback scenarios

### 2. PR Checklist
- [ ] Clear, descriptive title
- [ ] Detailed description of changes
- [ ] Screenshots for UI changes
- [ ] Link to related issues
- [ ] Test instructions included

### 3. PR Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Tested with AI APIs enabled
- [ ] Tested with AI APIs disabled (fallback)

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information or context.
```

## 🎨 Design Guidelines

### UI/UX Principles
- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: Follow WCAG guidelines
- **Consistency**: Use existing design patterns
- **Performance**: Optimize for speed and responsiveness

### Component Standards
- Use existing shadcn/ui components when possible
- Follow the established color scheme (fitfuel-purple, etc.)
- Ensure components are reusable and well-documented
- Include loading states and error handling

## 🤖 AI Integration Guidelines

### AI Features
- Always provide fallback functionality
- Handle API errors gracefully
- Cache AI responses when appropriate
- Respect API rate limits

### Testing AI Features
```bash
# Test with AI enabled
VITE_OPENAI_API_KEY=your_key npm run dev

# Test without AI (fallback mode)
npm run dev  # without API keys
```

## 🐛 Reporting Issues

When reporting bugs, please include:

### Bug Report Template
```markdown
## Bug Description
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
- AI Provider: [OpenAI/DeepSeek/None]

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
A clear and concise description of what you want to happen.

## Problem Solved
What problem does this feature solve?

## Proposed Solution
Describe the solution you'd like to see.

## Alternatives Considered
Describe any alternative solutions you've considered.

## Additional Context
Add any other context or screenshots about the feature request.
```

## 📚 Documentation Guidelines

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep README and guides updated
- Document API changes

### Documentation Types
- **README.md**: Project overview and quick start
- **DEPLOYMENT.md**: Deployment instructions
- **API.md**: AI API integration details
- **Component docs**: Individual component documentation

## 🏷️ Commit Message Guidelines

We follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(ai): add personalized workout generation
fix(ui): resolve mobile layout issues
docs(deployment): update Netlify instructions
style(components): apply consistent formatting
```

## 🔒 Security

### Reporting Security Issues
Please do not report security vulnerabilities through public GitHub issues. Instead:
1. Email the maintainers directly
2. Provide detailed information about the vulnerability
3. Allow time for the issue to be addressed before disclosure

### Security Guidelines
- Never commit API keys or secrets
- Use environment variables for sensitive data
- Follow security best practices
- Keep dependencies updated

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions for outstanding contributions

## 📞 Getting Help

Need help contributing? Reach out:
- 📧 **Email**: [Create an issue for support]
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Report bugs via GitHub Issues

## 📄 License

By contributing to FitFuel, you agree that your contributions will be licensed under the same license as the project.

## 🎉 Thank You!

Every contribution, no matter how small, makes FitFuel better. We appreciate your time and effort in making this project awesome!

**Happy Contributing!** 💪🚀