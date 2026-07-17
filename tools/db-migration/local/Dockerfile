FROM alpine:3.19

# Install PostgreSQL client and utilities
RUN apk add --no-cache \
    postgresql-client \
    bash \
    curl \
    ca-certificates

ARG MIGRATE_VERSION=v4.18.2
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        ARCH="arm64"; \
    fi && \
    curl -L "https://github.com/golang-migrate/migrate/releases/download/${MIGRATE_VERSION}/migrate.linux-${ARCH}.tar.gz" | tar xvz && \
    mv migrate /usr/local/bin/migrate && \
    chmod +x /usr/local/bin/migrate

WORKDIR /migrations

CMD ["sh"]