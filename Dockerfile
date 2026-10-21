# Production Dockerfile for Render Web Service
FROM php:8.2-apache

# Install PostgreSQL & MySQL PDO extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql

# Enable Apache rewrite module
RUN a2enmod rewrite

# Configure Apache DocumentRoot to point to backend/public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/backend/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Configure Apache to listen on port 10000 (Render default)
RUN sed -i 's/80/10000/g' /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf

# Copy project files
COPY . /var/www/html

# Set working directory & permissions
WORKDIR /var/www/html
RUN mkdir -p /var/www/html/backend/uploads && chown -R www-data:www-data /var/www/html/backend/uploads

EXPOSE 10000

CMD ["apache2-foreground"]
