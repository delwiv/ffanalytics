ARG BASE=node:20
FROM $BASE AS builder
WORKDIR /app
COPY ./package.json pnpm-lock.yaml ./
RUN corepack enable pnpm
RUN pnpm --filter ffanalytics-api install 
COPY packages ./

# FROM builder AS tester
# COPY tests ./tests
# RUN npm install
# COPY .env.test .env.test
# ENV TBD_ENV test
# CMD ["npm", "test"]

FROM $BASE AS runner
ARG TBD_ENV
ENV TBD_ENV=$TBD_ENV
WORKDIR /app
COPY --from=builder /app ./
COPY .env ./.env
EXPOSE $PORT
CMD ["pnpm", "--filter", "ffa", "start"]
