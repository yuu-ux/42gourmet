SERVICE_NAME = gourmet
REGION = asia-northeast1

.PHONY: build deploy

# Vueビルド
build:
	docker compose exec frontend npm run build

deploy:
	cd frontend && npm install && npm run build && cp -r ./dist ../backend/public
