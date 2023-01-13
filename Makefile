build:
	sam build --beta-features

deploy: build
	sam deploy \
		--stack-name=sns-application-platform \
		--resolve-s3 \
		--capabilities CAPABILITY_IAM
