# Git Workflow Guidelines

To ensure smooth collaboration and maintain a clean project history, please follow the workflow below every time you work on the project.

---

## Before You Start Working

Make sure you are on the Root Directory of the project.

Always pull the latest changes from the main branch to ensure your local repository is up to date.

```bash
git pull
```

This ensures that you’re working with the most recent version of the code and helps prevent merge conflicts later.

---

## Before You Push Changes

When you are ready to push your updates to GitHub, follow these steps carefully:

1. **Create and switch to a new branch** (never push directly to `main`):

    ```bash
    git checkout -b <branch-name>
    ```

    Example:

    ```bash
    git checkout -b feature/add-login-page
    ```

2. **Stage your changes**:

    ```bash
    git add .
    ```

3. **Commit your changes** with a meaningful message:

    ```bash
    git commit -m "Describe your changes clearly"
    ```

    Example:

    ```bash
    git commit -m "Added login form and basic authentication logic"
    ```

4. **Push your branch to the remote repository**:

    ```bash
    git push origin <branch-name>
    ```

---

## Creating a Pull Request (PR)

Once your branch has been pushed:

1. Go to [GitHub.com](https://github.com) and open the repository.
2. You’ll see a “Compare & Pull Request” button appear for your branch.
3. Click it to open a new Pull Request (PR).
4. Optionally, add comments describing your changes and any relevant context.
5. Click “Create Pull Request” to submit it for review.

---

## Review and Merge Process

- The project maintainer will review your pull request.
- If everything looks good, your PR will be merged into the `main` branch.
- After the merge, you can safely delete your branch both locally and on GitHub.

---

## After Your Pull Request Is Merged

Once your pull request (PR) has been **reviewed and merged into `main`**, you should:

1. **Switch back to the main branch**:

    ```bash
    git checkout main
    ```

2. **Pull the latest changes** (to make sure your local `main` matches the remote one):

    ```bash
    git pull
    ```

3. **Delete the feature branch locally**:

    ```bash
    git branch -D <branch-name>
    ```

    > Use `-d` (safe delete) — it will refuse to delete if the branch hasn’t been merged.
    > Use `-D` (force delete) only if you’re sure it’s safe to remove.

---
