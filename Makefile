SERVICE_NAME = gourmet
REGION = asia-northeast1

.PHONY: build deploy

# Vueビルド
build:
	docker compose run --rm frontend npm run build

# Cloud Run へデプロイ
deploy: build
	cd backend && gcloud run deploy $(SERVICE_NAME) \
		--source . \
		--region $(REGION) \
		--allow-unauthenticated
