# AI-DLC State Tracking

## Project Information
- **Project Name**: 테이블오더 서비스 (Table Order Service)
- **Project Type**: Greenfield
- **Start Date**: 2026-05-06T00:00:00Z
- **Current Stage**: INCEPTION - Workflow Planning (Unit 3: Admin App)
- **Current Stage**: CONSTRUCTION - Customer App - Workflow Planning

## Workspace State
- **Existing Code**: No
- **Reverse Engineering Needed**: No
- **Workspace Root**: /workspace

## Code Location Rules
- **Application Code**: Workspace root (NEVER in aidlc-docs/)
- **Documentation**: aidlc-docs/ only
- **Structure patterns**: See code-generation.md Critical Rules

## Extension Configuration
| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | Yes (Full) | Requirements Analysis |
| Property-Based Testing | Yes (Full) | Requirements Analysis |

## Tech Stack Decisions
| Area | Choice |
|------|--------|
| Backend | Go |
| Frontend | Vue.js (TypeScript) — 2 separate apps |
| Database | SQLite |
| Deployment | Docker |
| Repo Structure | Monorepo |
| PBT Framework (Backend) | rapid |
| PBT Framework (Frontend) | fast-check |

## Stage Progress
| Stage | Status | Notes |
|-------|--------|-------|
| Workspace Detection | COMPLETED | Greenfield project |
| Requirements Analysis | COMPLETED | requirements.md generated |
| User Stories | COMPLETED | 10 features, 38 stories generated |
| Workflow Planning | SKIPPED | User directed to Units Generation directly |
| Application Design | SKIPPED | Merged into Units Generation |
| Units Generation | COMPLETED | 3 units: Backend API, Customer App, Admin App |

## Current Unit: Customer App (Unit 2)
| Stage | Status | Notes |
|-------|--------|-------|
| Workflow Planning | COMPLETED | Execution plan approved |
| Functional Design | COMPLETED | 4 artifacts generated |
| NFR Requirements | COMPLETED | 2 artifacts generated |
| NFR Design | COMPLETED | 2 artifacts generated |
| Infrastructure Design | SKIP | Simple Nginx Docker, no design needed |
| Code Generation | IN PROGRESS | Part 1 (Planning) complete |
| Build and Test | PENDING | EXECUTE |
