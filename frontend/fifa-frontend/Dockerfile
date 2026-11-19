FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/fifa-frontend/browser /usr/share/nginx/html

RUN printf 'server {\n    listen 80;\n    listen [::]:80;\n    server_name localhost;\n    root /usr/share/nginx/html;\n    index index.html index.htm;\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n    error_page 500 502 503 504 /50x.html;\n    location = /50x.html {\n        root /usr/share/nginx/html;\n    }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]