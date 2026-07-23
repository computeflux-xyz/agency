FROM golang:1.26 AS build-stage

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -buildvcs=false -o site-api ./services/site-api

FROM gcr.io/distroless/static:nonroot

WORKDIR /

COPY --from=build-stage /app/site-api .
COPY --from=build-stage /app/services/site-api/docs ./docs

EXPOSE 8080

ENTRYPOINT ["./site-api"]
