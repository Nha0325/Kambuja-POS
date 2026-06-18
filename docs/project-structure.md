# Project structure

Requests enter through `public/index.php`, which loads `bootstrap/app.php`.
Bootstrap loads environment values and autoloading, starts the session, creates
the router, and loads `routes/web.php` and `routes/api.php`.

Routes dispatch to controllers under `app/Http/Controllers/`. Controllers use
services and models under `app/Services/` and `app/Models/`, then render PHP
templates from `resources/views/`.

Procedural pages from the earlier implementation are preserved under
`docs/legacy/old-public-pages/`; they are not browser entry points.
