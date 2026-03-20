npm run build

git checkout gh-pages
git rm -rf .
git add -f dist
git commit -m "deploy"
git push origin gh-pages
git checkout main
