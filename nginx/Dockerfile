# Use official nginx image
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx config
COPY certs /etc/nginx/certs
# Create certs directory
RUN mkdir -p nginx/certs

# Install openssl
RUN apk add --no-cache openssl bash


# Expose HTTP and HTTPS ports
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
