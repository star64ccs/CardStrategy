# 📝 Git Commit Message Conventions

**Project**: CardStrategy  
**Version**: 1.0.0  
**Last Updated**: 2025-01-02  

---

## 🎯 **Purpose**

This document establishes standardized Git commit message conventions to ensure:
- Clear and consistent commit history
- Easy collaboration among team members
- Automated changelog generation
- Better code review process
- Cross-platform compatibility (avoid encoding issues)

---

## 📋 **Commit Message Format**

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### **Components**

1. **Type** (Required): What kind of change this commit contains
2. **Scope** (Optional): What part of the codebase this affects
3. **Description** (Required): Brief description of the change
4. **Body** (Optional): Detailed explanation of the change
5. **Footer** (Optional): References to issues, breaking changes, etc.

---

## 🏷️ **Commit Types**

### **Core Types**

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add biometric authentication` |
| `fix` | Bug fix | `fix(api): resolve connection timeout issue` |
| `docs` | Documentation changes | `docs(readme): update installation guide` |
| `style` | Code style changes (formatting, etc.) | `style(components): fix indentation` |
| `refactor` | Code refactoring without feature changes | `refactor(services): optimize data processing` |
| `test` | Adding or updating tests | `test(utils): add validation tests` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |

### **Advanced Types**

| Type | Description | Example |
|------|-------------|---------|
| `perf` | Performance improvements | `perf(cache): optimize Redis queries` |
| `ci` | CI/CD changes | `ci(workflows): fix deployment pipeline` |
| `build` | Build system changes | `build(webpack): update configuration` |
| `revert` | Reverting previous commits | `revert: feat(auth): add biometric authentication` |
| `merge` | Merge commits | `merge: feature/auth-system into develop` |

---

## 🎯 **Scopes**

### **Frontend Scopes**

- `ui` - User interface components
- `components` - React components
- `screens` - App screens
- `navigation` - Navigation logic
- `theme` - Theming and styling
- `i18n` - Internationalization
- `hooks` - Custom React hooks
- `utils` - Utility functions
- `services` - Frontend services
- `store` - State management

### **Backend Scopes**

- `api` - API endpoints
- `routes` - Route handlers
- `models` - Data models
- `services` - Business logic services
- `middleware` - Express middleware
- `config` - Configuration files
- `database` - Database related
- `auth` - Authentication
- `security` - Security features
- `validation` - Input validation

### **Infrastructure Scopes**

- `ci` - Continuous Integration
- `cd` - Continuous Deployment
- `docker` - Docker configuration
- `deploy` - Deployment scripts
- `monitoring` - Monitoring and logging
- `scripts` - Utility scripts
- `docs` - Documentation

### **General Scopes**

- `core` - Core functionality
- `shared` - Shared code
- `tests` - Test files
- `deps` - Dependencies
- `config` - Configuration

---

## ✍️ **Description Guidelines**

### **Format**
- Use lowercase for the description
- No period at the end
- Maximum 50 characters for the first line
- Use imperative mood ("add" not "added")

### **Good Examples**
```
feat(auth): add biometric authentication
fix(api): resolve connection timeout
docs(readme): update installation steps
```

### **Bad Examples**
```
feat(auth): Added biometric authentication.
fix(api): fixing connection timeout issue
docs(readme): updating installation steps
```

---

## 📄 **Body Guidelines**

### **When to Use Body**
- Complex changes that need explanation
- Breaking changes
- Multiple related changes
- Context for the change

### **Format**
- Blank line after description
- Wrap at 72 characters
- Explain **what** and **why**, not **how**

### **Example**
```
feat(auth): add biometric authentication

Implement Face ID and Touch ID support for iOS and Android.
This improves user experience by providing secure and convenient
authentication without requiring password input.

- Add biometric service for iOS
- Add biometric service for Android
- Update authentication flow
- Add fallback to password authentication
```

---

## 🔗 **Footer Guidelines**

### **References**
```
Closes #123
Fixes #456
Related to #789
```

### **Breaking Changes**
```
BREAKING CHANGE: Authentication API now requires token parameter
```

### **Co-authors**
```
Co-authored-by: John Doe <john@example.com>
```

---

## 🌍 **Language Requirements**

### **English Only**
- All commit messages MUST be in English
- Use clear, professional language
- Avoid slang or colloquialisms
- Use proper grammar and spelling

### **Character Encoding**
- Use UTF-8 encoding
- Avoid special characters that might cause encoding issues
- Use standard ASCII characters when possible

---

## 📋 **Examples**

### **Feature Addition**
```
feat(cards): add card authenticity verification

Implement AI-powered card authenticity checking using computer vision.
This feature helps users identify potentially fake cards and provides
confidence scores for authenticity assessment.

- Add authenticity verification service
- Implement image processing pipeline
- Add confidence scoring algorithm
- Create verification result UI components

Closes #234
```

### **Bug Fix**
```
fix(api): resolve database connection pool exhaustion

Fix issue where database connections were not being properly released,
causing connection pool exhaustion and API timeouts.

- Properly close database connections in error cases
- Add connection timeout configuration
- Implement connection health checks

Fixes #567
```

### **Documentation Update**
```
docs(api): update authentication endpoint documentation

Update API documentation to reflect new authentication requirements
and provide clearer examples for developers.

- Add JWT token examples
- Update error response documentation
- Add rate limiting information
```

### **Refactoring**
```
refactor(services): optimize data processing pipeline

Restructure data processing service to improve performance and
maintainability by separating concerns and reducing complexity.

- Extract data validation into separate module
- Implement async processing for large datasets
- Add progress tracking for long-running operations
```

### **CI/CD Changes**
```
ci(workflows): fix deployment pipeline for production

Resolve issues with production deployment pipeline that were causing
failed deployments and inconsistent environment configurations.

- Fix DigitalOcean deployment configuration
- Update environment variable handling
- Add deployment health checks

Fixes #890
```

---

## 🚫 **Common Mistakes to Avoid**

### **Bad Practices**
```
// Too vague
fix: stuff

// Wrong tense
feat: added new feature

// Too long description
feat: implement comprehensive authentication system with multiple providers and security features

// No scope when needed
feat: add authentication (should be feat(auth): add authentication)

// Chinese characters (causes encoding issues)
feat: 添加認證功能
```

### **Good Practices**
```
// Clear and specific
fix(auth): resolve token expiration issue

// Correct tense
feat(auth): add OAuth2 integration

// Concise description
feat(auth): add OAuth2 integration

// Proper scope
feat(auth): add OAuth2 integration

// English only
feat(auth): add authentication functionality
```

---

## 🔧 **Tools and Automation**

### **Commitlint**
Add commitlint to enforce these conventions:

```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

### **Husky Hooks**
```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### **VS Code Extension**
Use "Conventional Commits" extension for guided commit message creation.

---

## 📚 **Additional Resources**

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

## ✅ **Quick Reference**

### **Template**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types**
`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`, `merge`

### **Scopes**
`ui`, `components`, `api`, `routes`, `services`, `config`, `tests`, `ci`, `cd`, etc.

### **Rules**
- English only
- Imperative mood
- 50 char max for description
- 72 char wrap for body
- No period at end of description

---

**Remember**: Good commit messages are essential for maintaining a clean and understandable project history! 📝✨
