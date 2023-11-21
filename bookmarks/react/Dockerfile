FROM node:lts-alpine as builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
RUN ls -al

RUN rm /etc/nginx/conf.d/default.conf

COPY deploy/nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]