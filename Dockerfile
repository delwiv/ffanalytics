ARG BASE=node:20
FROM $BASE AS builder
WORKDIR /app
COPY ./package.json pnpm-lock.yaml packages ./
RUN corepack enable pnpm
RUN pnpm api install 

# FROM builder AS tester
# COPY tests ./tests
# RUN npm install
# COPY .env.test .env.test
# ENV TBD_ENV test
# CMD ["npm", "test"]

# FROM $BASE AS runner
# ARG TBD_ENV
# ENV TBD_ENV=$TBD_ENV
# WORKDIR /app
# COPY --from=builder /app ./
COPY .env.docker ./.env
EXPOSE $PORT
CMD ["pnpm", "api", "start"]
