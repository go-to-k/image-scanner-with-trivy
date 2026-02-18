FROM public.ecr.aws/lambda/nodejs:24-arm64

WORKDIR /

COPY dist/index.js /var/task/index.js

COPY --from=aquasec/trivy:latest /usr/local/bin/trivy /opt

CMD ["index.handler"]