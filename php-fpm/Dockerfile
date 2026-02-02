FROM php:8.2-fpm

# Installieren von erforderlichen Abhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev \
    libicu-dev \
    zlib1g-dev \
    nodejs \
    npm \
    zip  \
    wget \
    unzip

# Install Database Driver & zip
RUN docker-php-ext-install -j$(nproc) pdo && \
    docker-php-ext-install -j$(nproc) pdo_mysql && \
    docker-php-ext-install zip && \
    docker-php-ext-configure intl && \
    docker-php-ext-install intl

# Composer installieren
RUN wget https://getcomposer.org/installer -O - -q | php -- --install-dir=/usr/local/bin --filename=composer

# Install the xdebug
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

# Panther-Abhängigkeiten installieren (Symfony Panther für Browser-Tests)
RUN pecl install pcov && docker-php-ext-enable pcov
RUN apt-get install -y libnss3 libgconf-2-4
RUN apt-get install -y chromium

 # Panther-Einstellungen konfigurieren
ENV PANTHER_NO_SANDBOX=1

# Clean
RUN apt-get clean autoclean && \
    apt-get autoremove --yes && \
    rm -rf /var/lib/{apt,dpkg,cache,log}

EXPOSE 9000