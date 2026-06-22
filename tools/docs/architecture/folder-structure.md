# Folder Structure

```text
Kambuja-POS/
├── Backend/
│   ├── config/
│   ├── constants/
│   ├── controller/
│   ├── database/
│   ├── guards/
│   ├── helper/
│   ├── models/
│   └── routes/
├── Frontend/
│   └── src/
│       ├── components/
│       │   ├── navigation/
│       │   └── ui/
│       ├── configs/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       │   ├── admin-manager/
│       │   ├── admin/
│       │   ├── auth/
│       │   └── cashier/
│       ├── routes/
│       ├── services/
│       └── utils/
├── scripts/
└── tools/
```

The project uses one backend and one frontend. Role-specific behavior is separated by backend guards and frontend route groups.
