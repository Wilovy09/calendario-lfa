npm run build

let workflow = (open --raw .github/workflows/deploy.yml)

git checkout gh-pages
git rm -rf .
"node_modules" | save .gitignore
mkdir .github/workflows
$workflow | save .github/workflows/deploy.yml
git add -f dist
git add .gitignore
git add .github
git commit -m "deploy"
git push origin gh-pages
git checkout main
