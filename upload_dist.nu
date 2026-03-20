npm run build

let workflow = (open --raw .github/workflows/deploy.yml)
let date = (date now | format date "%d-%m-%Y %H:%M")
cp -r dist /tmp/lfa-dist

git checkout gh-pages
git rm -rf .
rm -rf dist

"node_modules" | save .gitignore
mkdir .github/workflows
$workflow | save .github/workflows/deploy.yml
cp -r /tmp/lfa-dist dist
rm -rf /tmp/lfa-dist

git add -f dist
git add .gitignore
git add .github
git commit -m $"deploy ($date)"
git push origin gh-pages
git checkout main
