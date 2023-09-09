# ------------------------------------------------------------#
# trivy Install Layer
# ------------------------------------------------------------#
FROM arm64v8/alpine:3.18 AS trivy

WORKDIR /

RUN mkdir -p /trivy

RUN apk --update add --no-cache curl 

RUN \
    VERSION=$( \
    curl --silent "https://api.github.com/repos/aquasecurity/trivy/releases/latest" | \
    grep '"tag_name":' | \
    sed -E 's/.*"v([^"]+)".*/\1/' \
    ) && curl -L -o trivy_${VERSION}_Linux-ARM64.tar.gz https://github.com/aquasecurity/trivy/releases/download/v${VERSION}/trivy_${VERSION}_Linux-ARM64.tar.gz \
    && tar zxf trivy_${VERSION}_Linux-ARM64.tar.gz -C /trivy \
    && rm trivy_${VERSION}_Linux-ARM64.tar.gz

# ------------------------------------------------------------#
# Run Layer
# ------------------------------------------------------------#
FROM public.ecr.aws/lambda/nodejs:18-arm64

WORKDIR /

COPY dist/index.js /var/task/index.js

COPY --from=trivy /trivy/trivy /opt

CMD ["index.handler"]
