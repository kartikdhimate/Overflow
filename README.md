# Overflow

Overflow is a Stack Overflow-style application built from several .NET services, a Next.js web application, PostgreSQL, RabbitMQ, Typesense, and Keycloak. Aspire builds the application containers and generates the production Docker Compose files.

## Prerequisites

Install the following tools before starting the application:

- .NET SDK with the Aspire workload installed
- Aspire CLI
- Docker or Podman
- Git

## Configure the environment

The production deployment reads its variables from `infra/.env`. Create or update that file before deploying. Do not commit real passwords, API keys, certificates, or other secrets.

The file must contain the following keys:

```dotenv
# Absolute paths on the host machine
KEYCLOAK_BINDMOUNT_0=C:\path\to\Overflow\infra\realms
NGINX_PROXY_BINDMOUNT_0=C:\path\to\Overflow\infra\devcerts

# Secrets; replace every example value with a private value
KEYCLOAK_PASSWORD=replace-with-a-strong-keycloak-password
MESSAGING_PASSWORD=replace-with-a-strong-rabbitmq-password
POSTGRES_PASSWORD=replace-with-a-strong-postgres-password
TYPESENSE_API_KEY=replace-with-a-strong-typesense-api-key

# Aspire fills these image names and ports during deployment.
# Leave them empty when using `aspire deploy` or the Aspire Docker Compose command.
PROFILE_SVC_IMAGE=
PROFILE_SVC_PORT=
QUESTION_SVC_IMAGE=
QUESTION_SVC_PORT=
SEARCH_SVC_IMAGE=
SEARCH_SVC_PORT=
STAT_SVC_IMAGE=
STAT_SVC_PORT=
VOTE_SVC_IMAGE=
VOTE_SVC_PORT=
WEBAPP_IMAGE=
```

`KEYCLOAK_BINDMOUNT_0` and `NGINX_PROXY_BINDMOUNT_0` must be absolute paths. On Windows, use a path such as `C:\Learn\overflow\Overflow\infra\realms`. If Aspire generates or updates `infra/.env`, keep the generated image and port values; do not replace them with arbitrary values.

The Next.js application also expects these values when it is run separately from the Aspire deployment. Add them to `webapp/.env` for local web app development:

```dotenv
AUTH_KEYCLOAK_ISSUER=https://id.overflow.local/realms/overflow
AUTH_KEYCLOAK_ISSUER_INTERNAL=http://keycloak:8080/realms/overflow
AUTH_KEYCLOAK_ID=nextjs
AUTH_KEYCLOAK_SECRET=replace-with-the-nextjs-client-secret
AUTH_SECRET=replace-with-a-long-random-auth-secret
AUTH_URL=https://app.overflow.local
API_URL=https://api.overflow.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=replace-with-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=replace-with-cloudinary-api-key
CLOUDINARY_API_SECRET=replace-with-cloudinary-api-secret
```

The `webapp/.env` file is ignored by Git. Keep all secret values private.

## Configure local host names

The production setup uses an Nginx reverse proxy and the following host names. Add this line to the operating system hosts file:

```text
127.0.0.1 id.overflow.local app.overflow.local api.overflow.local
```

On Windows, edit:

```text
C:\Windows\System32\drivers\etc\hosts
```

Run the editor as Administrator so the file can be saved. On Linux or macOS, edit `/etc/hosts` with administrator permissions.

## Start the application

From the solution folder, run one of the following commands:

```bash
aspire deploy -o infra
```

This builds the services, generates the production deployment files in `infra`, and starts the application resources.

Alternatively, use the Aspire Docker Compose workflow:

```bash
aspire do docker-compose-up-production -o infra
```

After startup, open the application at:

```text
https://app.overflow.local
```

Keycloak is available at `https://id.overflow.local`, and the API gateway is available at `https://api.overflow.local`. The Aspire dashboard is available at `http://localhost:8080`.

## Keycloak administrator login

Use `kc-prod` as the Keycloak administrator username and the value of `KEYCLOAK_PASSWORD` as its password.

> Note: the checked-in production Compose template currently sets the bootstrap username to `admin`. If the deployed instance accepts `admin` instead of `kc-prod`, use the username configured in the generated `infra/docker-compose.yaml` or update the deployment configuration before starting it.

## Stop or remove the application

To stop the containers while keeping their Docker or Podman resources and data volumes, run this from the solution folder:

```bash
aspire do docker-compose-down-production -o infra
```

To stop the application and remove all of its Docker or Podman resources, run:

```bash
aspire destroy -o infra
```

The destroy command removes the resources created for the application. Treat it as a cleanup operation: persistent data stored in application volumes may also be removed.

## Troubleshooting

- If a `.overflow.local` address does not open, verify the hosts-file entry and confirm that Docker or Podman is running.
- If deployment reports missing variables, check that `infra/.env` exists and contains every required key.
- If HTTPS shows a certificate warning, verify that the certificates in `infra/devcerts` are present and that the Nginx bind-mount path is correct.
- If a service cannot connect to PostgreSQL or RabbitMQ, check `POSTGRES_PASSWORD` and `MESSAGING_PASSWORD`, then restart the deployment.