FROM node:slim
# ENV NODE_ENV production
LABEL createdat="basharq.net"
WORKDIR /usr/breakingnews-server
COPY ["pnpm-lock.yaml", "./"]
RUN pnpm install --silent
COPY . .
EXPOSE 5001
CMD node /usr/src/breakingnews-server/public/bundle.js