# Overflow

Overflow is a Stack Overflow-style application built from several .NET services, a Next.js web application, PostgreSQL, RabbitMQ, Typesense, and Keycloak. Aspire builds the application containers and generates the production Docker Compose files.

## Repository structure

The repository is organized by responsibility. The backend is split into small services, while the shared projects contain code used by more than one service.

```text
Overflow/
|-- Overflow.AppHost/          Aspire application host and service wiring
|-- Overflow.ServiceDefaults/  Shared Aspire service defaults and telemetry setup
|-- Common/                    Shared authentication, database, messaging, and API helpers
|-- Contracts/                 Events and message contracts shared between services
|-- Reputation/                Shared reputation rules and calculations
|-- ProfileService/            User profiles and profile-related message handlers
|-- QuestionService/           Questions, answers, tags, validation, and question data
|-- SearchService/             Search indexing and queries backed by Typesense
|-- StatsService/              Statistics and read-model projections
|-- VoteService/               Votes and vote-related reputation updates
|-- webapp/                    Next.js frontend for the Overflow website
|-- infra/                     Docker Compose output, Keycloak realms, and local TLS certificates
|-- aspire.config.json         Aspire CLI configuration
|-- Overflow.slnx              .NET solution file
`-- README.md                  Setup and deployment instructions
```

### Backend projects

| Project | Purpose |
| --- | --- |
| `Overflow.AppHost` | Defines the distributed application: databases, RabbitMQ, Typesense, Keycloak, backend services, API gateway, frontend, and production proxy. |
| `Overflow.ServiceDefaults` | Provides common ASP.NET Core and Aspire configuration, including service discovery, resilience, health checks, and OpenTelemetry. |
| `Common` | Contains reusable application infrastructure such as authentication extensions, pagination, database migration helpers, and Wolverine messaging configuration. |
| `Contracts` | Defines the messages exchanged through the event bus, including question, vote, answer-count, and reputation events. Keep these types stable because multiple services depend on them. |
| `Reputation` | Contains the shared reputation logic used when question, answer, and vote events change a user's reputation. |
| `ProfileService` | Owns profile data and profile-related endpoints and message handlers. |
| `QuestionService` | Owns questions and answers, including controllers, DTOs, validation, persistence, and message handlers. |
| `SearchService` | Maintains and queries the Typesense search index in response to application events. |
| `StatsService` | Builds statistics and projections from events for read-only queries. |
| `VoteService` | Owns vote data and vote endpoints, then publishes events used by other services. |

Most backend services follow the same internal pattern: `Program.cs` configures the service, `Data/` contains persistence code, `Models/` contains domain or database models, `DTOs/` contains API request and response types, and `MessageHandlers/` processes asynchronous events. Some services also have folders for their specific concerns, such as `Controllers/`, `Validators/`, `Projections/`, or `Middleware/`.

### Frontend and infrastructure

- `webapp/src/app/` contains Next.js routes and pages.
- `webapp/src/components/` contains reusable UI components.
- `webapp/src/lib/` contains frontend utilities and shared client-side logic.
- `webapp/src/auth.ts` and `webapp/src/proxy.ts` contain authentication and request-proxy support.
- `infra/docker-compose.yaml` is the deployment Compose file generated or updated by Aspire.
- `infra/realms/` contains the Keycloak realm import used to configure authentication.
- `infra/devcerts/` contains local HTTPS certificates for the reverse proxy.

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

## Test the APIs

You can test the APIs with [Bruno](https://www.usebruno.com/) or [Postman](https://www.postman.com/). Import the [Bruno collection](aspire_overflow_bruno.yml) or the [Postman collection](aspire_overflow_postman.json), then run the requests against the local or deployed endpoints configured in the collection.

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
- If HTTPS is not working or the local certificate is not trusted, install [mkcert](https://github.com/FiloSottile/mkcert) with Chocolatey (`choco install mkcert`) or Scoop (`scoop bucket add extras; scoop install mkcert`), then run these commands from the solution folder:

	```powershell
	mkcert -install
	mkcert -cert-file infra/devcerts/overflow.local.crt -key-file infra/devcerts/overflow.local.key "*.overflow.local" overflow.local
	```

	Restart the deployment after generating the certificates. The `mkcert -install` command adds its local CA to the Windows trust store. Keep the generated `rootCA-key.pem` private; these certificates are for local development only.
- If a service cannot connect to PostgreSQL or RabbitMQ, check `POSTGRES_PASSWORD` and `MESSAGING_PASSWORD`, then restart the deployment.