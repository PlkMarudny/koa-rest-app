FROM node:slim
# ENV NODE_ENV production
LABEL createdat="basharq.net" maintainer="tomasz.plonka@basharq.com" project="breaking news server"
WORKDIR /home/breakingnews-server
COPY pnpm-lock.yaml package.json ./
COPY .env .env.example ./
RUN npm i -g pnpm
RUN pnpm i
USER node
COPY --chown=node:node public/ ./public
EXPOSE 5001
CMD ["node", "./public/bundle.js"]