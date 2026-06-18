# FTC POS (MenuLux-style) – Fixed Build

**Fixes included**
- Table status switches to **busy** on entering order screen.
- Stock check **disabled** (you can sell any item even if stock=0) and stock is not decremented.
- Schema works on MySQL 5.7 (safe index creation).

## Install
1) Upload folder to `/var/www/html/ftc-pos`
2) Make uploads writable:
   sudo chown -R www-data:www-data /var/www/html/ftc-pos/uploads
   sudo chmod -R 775 /var/www/html/ftc-pos/uploads
3) New DB:
   mysql -u root -p < /var/www/html/ftc-pos/schema.sql
   (Existing DB? run: mysql -u root -p < /var/www/html/ftc-pos/migration_001_add_category.sql)
4) Open: http://<server>/ftc-pos/public/index.php
