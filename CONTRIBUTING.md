# Contributing to Session Communicator MCP Server

Thank you for your interest in contributing to the Session Communicator MCP Server! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

### 1. Report Bugs
- Use the [GitHub issue tracker](https://github.com/ruvnet/ruflo/issues)
- Include detailed steps to reproduce
- Provide system information (OS, Node version, Claude Code version)
- Include error messages and logs

### 2. Suggest Features
- Open a feature request issue
- Describe the use case
- Explain why it would be useful
- Provide examples if possible

### 3. Improve Documentation
- Fix typos and errors
- Add examples
- Improve clarity
- Translate to other languages

### 4. Submit Code
- Fix bugs
- Implement features
- Improve performance
- Add tests

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Claude Code installed
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/ruvnet/ruflo.git
cd ruflo/src/mcp-servers/session-communicator

# Install dependencies
npm install

# Run tests
npm test

# Run demo
npm run demo
```

## 📝 Development Guidelines

### Code Style
- Use ES modules (import/export)
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Write tests for new features
- Ensure all tests pass before submitting
- Aim for high test coverage
- Include integration tests

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Documentation
- Update README.md for new features
- Add examples for new functionality
- Update CHANGELOG.md
- Keep documentation in sync with code

### Commit Messages
Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(cli): add batch send command

Add ability to send messages to multiple sessions at once.

Closes #123
```

```
fix(mcp): handle missing session gracefully

Return empty result instead of throwing error when session doesn't exist.

Fixes #456
```

## 🔄 Pull Request Process

### 1. Fork and Branch
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ruflo.git

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write code
- Add tests
- Update documentation
- Run tests locally

### 3. Commit Changes
```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(scope): description"
```

### 4. Push and Create PR
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### 5. PR Requirements
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Commit messages follow conventions
- [ ] No merge conflicts

### 6. Review Process
- Maintainers will review your PR
- Address feedback and comments
- Make requested changes
- PR will be merged when approved

## 🧪 Testing Guidelines

### Unit Tests
- Test individual functions
- Mock external dependencies
- Use descriptive test names

```javascript
describe('session_send_message', () => {
  it('should send message with priority', async () => {
    // Test implementation
  });
});
```

### Integration Tests
- Test complete workflows
- Use real file system
- Clean up after tests

```javascript
describe('Message Flow', () => {
  it('should send and receive messages', async () => {
    // Test implementation
  });
});
```

### Running Tests
```bash
# All tests
npm test

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

## 📚 Documentation Guidelines

### README.md
- Keep it concise
- Include quick start
- Show common examples
- Link to detailed docs

### Code Comments
```javascript
/**
 * Send a message to another session
 * @param {string} sessionId - Target session ID
 * @param {string} message - Message content
 * @param {string} priority - Priority level (low/normal/high)
 * @returns {Promise<Object>} Result with message ID
 */
async function sendMessage(sessionId, message, priority) {
  // Implementation
}
```

### Examples
- Show real-world use cases
- Include complete code
- Explain what it does
- Show expected output

## 🌐 Translation Guidelines

### Adding New Language
1. Create new documentation file: `docs/session-communicator-usage-{lang}.md`
2. Translate all sections
3. Keep code examples in English
4. Update language index
5. Add to README.md

### Translation Quality
- Use native speakers when possible
- Keep technical terms consistent
- Maintain formatting
- Test all code examples

## 🐛 Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 11]
- Node version: [e.g., 18.0.0]
- Claude Code version: [e.g., 1.0.0]
- Session Communicator version: [e.g., 1.0.0]

**Logs**
```
Paste relevant logs here
```

**Additional context**
Any other context about the problem.
```

## 💡 Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Use case**
How would this feature be used?

**Additional context**
Any other context or screenshots.
```

## 📋 Checklist for Contributors

Before submitting a PR:

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow conventions
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Error handling added
- [ ] Edge cases considered

## 🤝 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

### Enforcement
Violations may result in temporary or permanent ban from the project.

## 📞 Getting Help

### Questions
- Open a discussion on GitHub
- Check existing issues
- Read documentation

### Contact
- GitHub Issues: https://github.com/ruvnet/ruflo/issues
- Email: support@ruflo.dev (if available)

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to Session Communicator MCP Server!

---

*Last updated: April 16, 2026*
