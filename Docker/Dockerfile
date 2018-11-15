FROM algebr/openface:latest

LABEL maintainer="Shaoyen Tseng <shaoyen.t@gmail.com>"

ARG BUILD_DIR=/home/build-dep

ARG OPENFACE_DIR=/var/www/cgi-bin/OpenFace

RUN apt-get update && \
    apt-get install -y php5 libapache2-mod-php5  \
    php5-fpm php5-cli php5-mysqlnd php5-pgsql php5-sqlite php5-redis \
    php5-apcu php5-intl php5-imagick php5-mcrypt php5-json php5-gd php5-curl && \
    php5enmod mcrypt && \
    rm -rf /var/lib/apt/lists/* 

# Enable apache mods.
RUN a2enmod php5 && a2enmod rewrite

# Manually set up the apache environment variables
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid

# Copy repo into place.
RUN rm -rf /var/www/html && cd /tmp/ && git clone https://github.com/stefan-niculae/physio-difficulty.git && mv physio-difficulty /var/www/html && \
    mkdir -p /var/www/html/uploads && mkdir -p /var/www/html/processed && chown -R www-data:www-data /var/www/html && \
    mkdir -p /var/www/cgi-bin && mv /home/openface-build ${OPENFACE_DIR} && rm -rf ${BUILD_DIR}

# Expose apache.
EXPOSE 80

# Update the default apache site with the config we created.
# ADD apache-config.conf /etc/apache2/sites-enabled/000-default.conf

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]

# ENTRYPOINT ["/bin/bash"]
