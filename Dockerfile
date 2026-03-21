# Build stage
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY env.sh /env.sh
RUN chmod +x /env.sh
EXPOSE 80
ENTRYPOINT ["/env.sh"]
CMD ["nginx", "-g", "daemon off;"]
