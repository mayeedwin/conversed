# Git & Workflow Conventions

## Workflow Guidelines

- **Avoid running scripts unnecessarily**: Do NOT run build, lint, or test scripts unless explicitly requested or during final release validation.
- **Cleanup Temporary Files**: Always remove any temporary files, scratch analysis reports, or summary files created during task execution.

---

## Git Conventions

### 1. Branch Naming
Use `type/short-kebab-case-description` (for example `feature/block-ast-parser`, `fix/table-action-handler`, `chore/ai-skills`). 

* **Branch Prefixes**: Use `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `hotfix/`. (Use `feature/`, not `feat/`).
* **Work Item / Issue ID**: Do **not** put the work item or issue ID in the branch name. Use `#issue_id` inside commit messages instead.

### 2. Commit Message Format
All commits must follow the conventional commit format:

```text
type(scope): #issue_number description
```

*(Note: `#issue_number` is optional if there is no issue attached).*

#### Allowed Types:
`build`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `style`, `test`, `chore`, `hotfix`

#### Examples:
- `feat(dashboard): #1234 add new widget component`
- `fix(table-parser): #5678 resolve table row action parsing issue`
- `refactor(stream): #9012 optimize stream accumulator buffering`
- `docs(readme): update project documentation and installation guide`

---

### 3. Scope Matching Rule (CRITICAL)
- **Scope MUST match the current branch name**:
  - The scope MUST be derived from the branch name (the string after `feature/`, `fix/`, `chore/`, `refactor/`).
  - **Always check your branch name first**: Run `git branch --show-current` before committing to ensure the scope matches.
  - **Examples**:
    - Branch: `chore/ai-skills` → Commit: `chore(ai-skills): #1234 update documentation`
    - Branch: `feature/user-profile` → Commit: `feat(user-profile): #5678 add profile page`
    - Branch: `fix/login-bug` → Commit: `fix(login-bug): #9012 resolve redirect issue`

---

## Pull Request Guidelines

When opening a Pull Request (via GitHub CLI `gh pr create` or web interface):

1. **Title Format**: Title must match the conventional commit format: `type(scope): #issue description`.
2. **Title Scope**: The PR scope MUST match the branch name scope.
3. **Description**: Include a concise summary of changes and bullet points of completed commits.
