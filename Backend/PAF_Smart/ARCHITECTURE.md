# Backend Folder Architecture

Base package: `com.smartcampus`

Use a feature-based modular layout for the Spring Boot backend.

```text
src/main/java/com/smartcampus
|-- SmartCampusBackendApplication.java
|-- config/                     # Shared Spring configuration
|-- exception/                  # Shared exceptions + global handlers
|-- auth/                       # Auth module (package placeholder)
|-- booking/                    # Booking module (package placeholder)
|-- resource/                   # Resource module (package placeholder)
`-- ticket/                     # Incident/ticket module
    |-- controller/             # Ticket REST endpoints
    |-- dto/                    # Ticket request/response payloads
    |-- entity/                 # Ticket MongoDB documents
    |-- repository/             # Ticket repositories
    `-- service/                # Ticket business logic
```

## Request Flow

`Controller -> Service -> Repository -> MongoDB`

## Notes

- Existing API behavior is unchanged during this refactor.
- Current implemented module: `ticket`.
- `auth`, `booking`, and `resource` are reserved for upcoming assignment modules.
- Keep validation in DTO/controller boundaries and business rules in services.
