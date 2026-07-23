# Git & Workflow Conventions

## Workflow

- Do **not** run build/lint/test scripts unless explicitly requested or during final release validation.
- Clean up any temporary files, scratch reports, or summaries created during a task.

## Branches

`type/short-kebab-case-description` — e.g. `feature/block-ast-parser`, `fix/table-action-handler`.

- Prefixes: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `hotfix/` (use `feature/`, not `feat/`).
- Do **not** put the work item / issue ID in the branch name — use `#issue_id` in the commit message.

## Commits

Conventional format: `type(scope): #issue_number description` (`#issue_number` optional).

- Types: `build`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `style`, `test`, `chore`, `hotfix`.
- **Scope MUST match the branch name** (the string after the prefix). Run `git branch --show-current` before committing.

| Branch | Commit |
| --- | --- |
| `chore/ai-skills` | `chore(ai-skills): #1234 update documentation` |
| `feature/user-profile` | `feat(user-profile): #5678 add profile page` |
| `fix/login-bug` | `fix(login-bug): #9012 resolve redirect issue` |

## Pull Requests

- Title matches the commit format `type(scope): #issue description`; scope matches the branch.
- Description: concise summary plus bullet points of completed commits.
