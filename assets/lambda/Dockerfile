FROM public.ecr.aws/lambda/nodejs:24-arm64

WORKDIR /

COPY dist/index.js /var/task/index.js

COPY --from=ghcr.io/aquasecurity/trivy:0.69.3@sha256:bcc376de8d77cfe086a917230e818dc9f8528e3c852f7b1aff648949b6258d1c /usr/local/bin/trivy /opt

CMD ["index.handler"]