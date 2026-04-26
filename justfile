set dotenv-required := true
set dotenv-path := ".env"

scores:
    cd scripts; npm i; npx playwright install chromium; node scrape-scores.mjs