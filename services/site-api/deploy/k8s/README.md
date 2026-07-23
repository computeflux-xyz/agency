# site-api — Kubernetes deploy

Same shape as the shared per-service pattern (see the shared-infrastructure guide):

```
deploy/k8s/
  namespace.yaml            namespace: site-api
  helmfile.gotmpl           release -> ./helm, image tag from $IMAGE_TAG
  helm/                     Chart + values + Rollout / Service / ConfigMap
  database/database.yaml    CloudNativePG Cluster + daily ScheduledBackup
  *.sealed.yaml             SealedSecrets (created with kubeseal, see below)
```

The app runs as an Argo `Rollout` (canary), pulls its image from the zot registry,
reads non-secret config from a ConfigMap and every secret from a `SealedSecret`
via env vars (`CONFIG_*`). Postgres is a dedicated cnpg cluster; article assets
go to the Cloudflare R2 bucket `computeflux-site-assets`
(`services/site/deploy/terraform`), served at `https://assets.computeflux.xyz`.

## One-time setup

```bash
kubectl apply -f namespace.yaml
kubectl apply -f database/database.yaml   # cnpg cluster + scheduled backup
# create the SealedSecrets below, commit them, then deploy (CI or local helmfile)
```

## Secrets

CloudNativePG generates the DB app secret (`site-api-pg-cluster-app`,
keys `username`/`password`) automatically — nothing to seal for the database.

Seal the rest against the cluster's sealed-secrets controller (in `foundation`)
and commit the `*.sealed.yaml` files next to this README. The CI deploy applies
every `*.sealed.yaml` in this directory.

```bash
KS="kubeseal --format=yaml --controller-namespace foundation --controller-name sealed-secrets-controller"

# 1. Image pull secret (zot registry credentials)
kubectl create secret docker-registry registry-pull-secret -n site-api \
  --docker-server=registry.computeflux.xyz \
  --docker-username="$(kubectl get secret -n platform zot-registry-auth -o jsonpath='{.data.username}' | base64 -d)" \
  --docker-password="$(kubectl get secret -n platform zot-registry-auth -o jsonpath='{.data.password}' | base64 -d)" \
  --dry-run=client -o yaml | $KS > registry-pull-secret.sealed.yaml

# 2. R2 storage credentials (create an R2 API token / S3 access key in Cloudflare)
kubectl create secret generic site-api-storage -n site-api \
  --from-literal=access-key='<R2_ACCESS_KEY_ID>' \
  --from-literal=secret-key='<R2_SECRET_ACCESS_KEY>' \
  --dry-run=client -o yaml | $KS > site-api-storage.sealed.yaml

# 3. Ingest bearer token (share the same value with whatever pushes articles)
kubectl create secret generic site-api-ingest -n site-api \
  --from-literal=token="$(openssl rand -base64 32)" \
  --dry-run=client -o yaml | $KS > site-api-ingest.sealed.yaml

# 4. DB backup credentials (Hetzner object storage keys, same as other services)
kubectl create secret generic site-api-db-backup -n site-api \
  --from-literal=access-key='<HETZNER_S3_ACCESS_KEY>' \
  --from-literal=secret-key='<HETZNER_S3_SECRET_KEY>' \
  --dry-run=client -o yaml | $KS > site-api-db-backup.sealed.yaml
```

## Deploy

Through the shared reusable workflows (add a `site-api.yaml` workflow in the
agency repo that calls `computeflux-xyz/shared-infrastructure/.github/workflows/*`),
or locally:

```bash
IMAGE_TAG=main-<sha> helmfile apply -f helmfile.gotmpl
kubectl-argo-rollouts status site-api -n site-api
```

## Gateway route

Expose the API at `https://apigateway.computeflux.xyz/agency-api` (the site's
`API_BASE_URL`) by adding a `/agency-api` path to the platform API gateway that
targets an `ExternalName` bridge to `site-api.site-api.svc.cluster.computeflux.local:8080`
(same pattern the bijougabriel services use).
