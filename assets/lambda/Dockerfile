FROM public.ecr.aws/lambda/nodejs:24-arm64

WORKDIR /

COPY dist/index.js /var/task/index.js

COPY --from=ghcr.io/aquasecurity/trivy:0.76.1@sha256:790fd66d1697395d8693d1acaa1ea702406a20f109b6fc7bac8db623eca6c06c /usr/local/bin/trivy /opt

CMD ["index.handler"]