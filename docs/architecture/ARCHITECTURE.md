# Architecture Overview

> **Status:** Draft
> **Last Updated:** $(date +%Y-%m-%d)

## System Overview

```
[High-level architecture diagram - ASCII or describe]
```

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | TBD | |
| Styling | TBD | |
| State Management | TBD | |
| Backend (if needed) | TBD | |
| Database | TBD | |
| Deployment | Docker | Self-hosted requirement |

## Component Architecture

```
[Component tree or module diagram]
```

## Data Flow

### Local Storage
[What's stored client-side]

### API Integrations
| Service | Protocol | Auth Method |
|---------|----------|-------------|
| Home Assistant | WebSocket/REST | Long-lived token |
| Uptime Kuma | REST | API key |
| AI Providers | REST | API keys |
| Search Backend | REST | Varies |

## Security Considerations

### API Key Storage
[Approach for handling sensitive credentials]

### CORS / Proxy Requirements
[Any backend proxy needs]

## Deployment Architecture

```
[Docker Compose structure]
```

## Browser Extension vs Web App

[Decision and rationale]
