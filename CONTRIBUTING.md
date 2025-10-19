# Contributing to Audio Transcription App

Thank you for your interest in contributing to the Audio Transcription App! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and considerate in all interactions.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. Node.js (>= 18.x)
2. React Native development environment set up
3. Git for version control
4. A GitHub account

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/audio-transcription-app.git
   cd audio-transcription-app
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/mdhamed238/audio-transcription-app.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Branch Naming Convention

Use descriptive branch names:
- `feature/add-language-support` - For new features
- `fix/audio-recording-bug` - For bug fixes
- `docs/update-api-reference` - For documentation
- `refactor/optimize-inference` - For code refactoring
- `test/add-unit-tests` - For adding tests

### Commit Message Guidelines

Follow the conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(transcription): add support for Spanish language

- Implement Spanish language model integration
- Add language detection for Spanish audio
- Update UI to show Spanish as an option

Closes #123
```

```
fix(audio): resolve memory leak in recording buffer

The audio recording buffer was not being properly released
after stopping recording, causing memory to accumulate.

Fixes #456
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional components and hooks in React

**Example:**

```typescript
/**
 * Transcribes an audio file using the ExecuTorch model
 * @param filePath - Path to the audio file
 * @param options - Transcription options
 * @returns Promise resolving to transcription result
 */
export async function transcribeAudioFile(
  filePath: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  // Implementation
}
```

### Code Style

Run linters before committing:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format code with Prettier
npm run format
```

### File Organization

```
src/
├── components/        # React components
│   ├── common/       # Reusable components
│   └── screens/      # Screen components
├── services/         # Business logic
│   ├── audio/        # Audio handling
│   ├── transcription/# Transcription logic
│   └── storage/      # Data persistence
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
├── hooks/            # Custom React hooks
└── native/           # Native module interfaces
```

## Testing Guidelines

### Writing Tests

- Write unit tests for all new features
- Aim for >80% code coverage
- Test edge cases and error conditions
- Use meaningful test descriptions

**Example:**

```typescript
describe('AudioTranscriber', () => {
  it('should start recording when startRecording is called', async () => {
    const transcriber = new AudioTranscriber(config);
    await transcriber.startRecording();
    expect(transcriber.isRecording()).toBe(true);
  });

  it('should throw error when model is not loaded', async () => {
    const transcriber = new AudioTranscriber(config);
    await expect(transcriber.transcribe()).rejects.toThrow('Model not loaded');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e:ios
npm run test:e2e:android
```

### Test Types

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test interactions between modules
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Benchmark critical operations

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest changes from upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all tests** and ensure they pass:
   ```bash
   npm test
   npm run lint
   ```

3. **Update documentation** if needed

4. **Test on both platforms** (iOS and Android) if applicable

### Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference to related issues (e.g., "Closes #123")
   - Screenshots/videos for UI changes
   - Test results and coverage information

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of the changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] E2E tests added/updated
   - [ ] Manual testing completed
   - [ ] Tested on iOS
   - [ ] Tested on Android

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests pass locally
   
   ## Related Issues
   Closes #(issue number)
   
   ## Screenshots (if applicable)
   Add screenshots here
   ```

### Review Process

- PRs require at least one approval
- Address review comments promptly
- Keep discussions focused and professional
- Be open to feedback and suggestions

### After Approval

Once approved and CI passes, a maintainer will merge your PR.

## Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Verify the bug exists in the latest version
3. Collect relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - Device: [e.g. iPhone 13, Samsung S21]
 - OS: [e.g. iOS 16.0, Android 12]
 - App Version: [e.g. 1.0.0]
 - Model: [e.g. whisper-tiny]

**Additional context**
Add any other context about the problem.

**Logs**
```
Paste relevant logs here
```
```

## Suggesting Enhancements

### Enhancement Proposal Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Any other relevant information.
```

## Community

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

### Getting Help

If you need help:
1. Check the README and documentation
2. Search existing issues and discussions
3. Ask in GitHub Discussions
4. Contact maintainers

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Audio Transcription App! 🎉
