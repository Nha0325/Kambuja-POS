# Folder Structure

```text
apps/
├── api/
├── web-admin-manager/
└── web-admin/
```

## Backend

```text
apps/api/src/main/java/com/kambujaflow/kambujapos/
├── common/
├── config/
├── controller/
├── dto/
│   ├── request/
│   └── response/
├── entity/
├── enums/
├── repository/
├── security/
├── service/
├── util/
└── waf/
```

- Controllers map HTTP requests and call services.
- Services contain business and authorization scope logic.
- Repositories contain MongoDB access methods.
- DTOs define API input and output.
- Entities map the 15 MongoDB collections.

## Frontends

Both React applications use:

```text
src/
├── app/
├── routes/
├── layouts/
├── pages/
├── features/
├── shared/
├── services/
└── assets/
```

- Pages compose feature components.
- Feature services contain module API calls.
- Feature stores contain client state.
- Shared UI contains only reusable presentation components.
- Global Axios configuration stays in `src/services/api.js`.
