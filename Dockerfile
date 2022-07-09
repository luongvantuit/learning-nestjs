FROM node:16.14.0 AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn add glob rimraf

RUN yarn install 

COPY . .

RUN npm run build

FROM node:16.14.0 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN yarn install 

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]