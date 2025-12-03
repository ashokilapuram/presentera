# Git Repository Setup Guide

This guide will help you initialize a fresh Git repository and prepare your project for deployment.

## Step-by-Step Instructions

### 1. Initialize Git Repository

Open your terminal in the project root directory and run:

```bash
# Initialize git repository
git init

# Check current status
git status
```

### 2. Verify .gitignore

Make sure `.gitignore` is in place. It should exclude:
- `node_modules/`
- `__pycache__/`
- `.env` files
- Build outputs
- IDE files

The root `.gitignore` file should already be configured.

### 3. Stage All Files

```bash
# Add all files to staging
git add .

# Verify what will be committed
git status
```

### 4. Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit: Presentera fullstack app"
```

### 5. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right
3. Select "New repository"
4. Fill in the details:
   - **Repository name:** `presentera-fullstack` (or your preferred name)
   - **Description:** "Fullstack presentation editor with React and FastAPI"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 6. Connect Local Repository to GitHub

After creating the repository on GitHub, you'll see instructions. Use these commands:

```bash
# Add remote origin (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If you're using SSH instead of HTTPS:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 7. Verify Connection

```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git (fetch)
# origin  https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git (push)
```

### 8. Test Push/Pull

```bash
# Make a small change (e.g., update README)
# Then commit and push
git add .
git commit -m "Test commit"
git push
```

## Common Git Commands

### Daily Workflow

```bash
# Check status
git status

# Add files
git add .                    # Add all files
git add specific-file.js     # Add specific file

# Commit
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull
```

### Branch Management

```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# List branches
git branch

# Merge branch
git checkout main
git merge feature/new-feature
```

### Viewing History

```bash
# View commit history
git log

# View changes
git diff

# View specific file history
git log --follow -- filename
```

## Troubleshooting

### Issue: "fatal: remote origin already exists"

**Solution:**
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Issue: "Permission denied" when pushing

**Solutions:**
1. **HTTPS:** You may need to use a Personal Access Token instead of password
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` permissions
   - Use the token as your password

2. **SSH:** Set up SSH keys
   ```bash
   # Generate SSH key (if you don't have one)
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Copy public key and add to GitHub
   cat ~/.ssh/id_ed25519.pub
   # Then add to GitHub: Settings → SSH and GPG keys → New SSH key
   ```

### Issue: Large files causing problems

**Solution:** Ensure `.gitignore` is properly configured. If you've already committed large files:

```bash
# Remove from git (but keep locally)
git rm --cached large-file.pptx

# Commit the removal
git commit -m "Remove large file from git"

# Push
git push
```

### Issue: Need to update .gitignore after files are tracked

**Solution:**
```bash
# Remove cached files
git rm -r --cached .

# Re-add everything (respecting .gitignore)
git add .

# Commit
git commit -m "Update .gitignore"
```

## Next Steps

After setting up Git:

1. ✅ Repository is initialized and connected to GitHub
2. ✅ Code is committed and pushed
3. ✅ Ready for deployment

**Now proceed to:**
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to Vercel and Render
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Configure environment variables

## Best Practices

1. **Commit Often:** Make small, frequent commits with clear messages
2. **Write Good Commit Messages:**
   - Use present tense: "Add feature" not "Added feature"
   - Be descriptive: "Fix CORS issue with frontend" not "Fix bug"
3. **Don't Commit:**
   - `.env` files
   - `node_modules/`
   - Build outputs
   - IDE-specific files
4. **Use Branches:** Create branches for new features
5. **Pull Before Push:** Always pull latest changes before pushing

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Ready to deploy?** Check out [DEPLOYMENT.md](./DEPLOYMENT.md)!

