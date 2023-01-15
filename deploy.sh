ng build --delete-output-path
rsync --delete --progress -ravz --chown=www-data:www-data dist/bahai.day/ root@bahai.day:/var/www/bahai.day/
