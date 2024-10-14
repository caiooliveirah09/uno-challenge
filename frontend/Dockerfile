FROM node:16

WORKDIR /

COPY . .

COPY .env.example .env

RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]