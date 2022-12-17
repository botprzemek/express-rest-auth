FROM node:19.3.0-slim
WORKDIR /express-rest-auth
COPY package.json ./../express-rest-auth
RUN npm install
COPY . ./../express-rest-auth
CMD ["npm", "start"]