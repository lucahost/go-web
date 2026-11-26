# go-web in the VPS cluster (vps.yaml, component web; lucahost/vps-gitops tenants/go-web.yaml).
# Next's standalone server on distroless Node 26 (CI's version), uid 1001 (the owner of go.db
# today), no shell, read-only root. Writable at run time: /data (the SQLite PV: go.db and its
# journal), /app/.next/cache and /tmp (emptyDirs). deploy/start.mjs guards against an empty
# database, runs `prisma migrate deploy` and starts the server.

FROM node:26.13.1-trixie-slim@sha256:abe7e5a82b61a8ef67b315b85497c9e65173387ccf2f4a029248184b8e020be5 AS build
WORKDIR /src
ENV NEXT_TELEMETRY_DISABLED=1 CHECKPOINT_DISABLE=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx prisma generate \
 && NEXT_OUTPUT=standalone npm run build \
 && node deploy/prisma-cli-closure.mjs /src /out/migrate \
 && cp -r prisma prisma.config.ts /out/migrate/

FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:a84242e747fbb5aaaa0180c273b6f7130ca34b3300082192ef58eea96089eb3c
WORKDIR /app
COPY --from=build /src/.next/standalone ./
COPY --from=build /src/.next/static ./.next/static
COPY --from=build /src/public ./public
COPY --from=build /out/migrate ./migrate
COPY deploy/start.mjs ./start.mjs
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 HOME=/tmp \
    DATABASE_URL=file:/data/go.db \
    NEXT_TELEMETRY_DISABLED=1 CHECKPOINT_DISABLE=1 PRISMA_HIDE_UPDATE_MESSAGE=1
USER 1001:1001
EXPOSE 3000
CMD ["/app/start.mjs"]
