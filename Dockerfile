# Defines Nginx base image
FROM nginx

# Copies source files do Nginx working directory
COPY . /usr/share/nginx/html

EXPOSE 80

# Defines command to execute the Nginx server when the container boots
CMD ["nginx", "-g", "daemon off;"]