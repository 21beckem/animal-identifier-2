<!--
SYNC IMPACT REPORT
==================
Version: NEW → 1.0.0 (Initial ratification)
Date: 2026-02-04

Principles Established:
- I. Type Safety First - Enforcing TypeScript/type-safe practices
- II. Component-Driven UI - Modular, reusable frontend architecture
- III. API Contract Integrity - OpenAPI schema validation & versioning
- IV. User Experience Consistency - Design system adherence
- V. Progressive Enhancement - Core functionality without JavaScript
- VI. Developer Simplicity - Minimal dependencies, clear conventions

Added Sections:
- Quality Standards (code review, testing, performance benchmarks)
- Development Workflow (branching strategy, deployment gates)

Templates Status:
- ✅ plan-template.md - Constitution Check section aligns with all 6 principles
- ✅ spec-template.md - User story prioritization aligns with UX consistency principle
- ✅ tasks-template.md - Test-first approach optional per project phase

Follow-up TODOs:
- None - all placeholders filled

Commit Message:
docs: ratify constitution v1.0.0 (code quality + UX consistency + developer simplicity principles)
-->

# Animal Identifier Constitution

## Core Principles

### I. Type Safety First

**MUST**:
- All TypeScript code MUST enable `strict` mode in `tsconfig.json`
- All API endpoints MUST use Zod schemas for request/response validation
- Component props MUST be typed (no implicit `any`)
- Backend types MUST be auto-generated from OpenAPI schemas where applicable

**MUST NOT**:
- Use `any` type without explicit justification documented in code comments
- Bypass TypeScript checks with `@ts-ignore` or `@ts-nocheck` unless absolutely necessary with documented rationale

**Rationale**: Type safety catches bugs at compile time, improves IDE autocomplete, and serves as living documentation. Critical for a data-driven wildlife tracking application where location/species accuracy is paramount.

---

### II. Component-Driven UI

**MUST**:
- Frontend components MUST be self-contained in their own directories with co-located styles (`comp.jsx` + `style.css`)
- Components MUST follow single responsibility principle (one clear purpose per component)
- Reusable components MUST be framework-agnostic (no business logic, props-driven)
- Component props MUST be documented via JSDoc when non-obvious

**MUST NOT**:
- Create components exceeding 200 lines without decomposition
- Mix data fetching logic with presentation logic (use composition)

**Rationale**: Modular components enable parallel development, easier testing, and consistent UX patterns across the wildlife documentation platform.

---

### III. API Contract Integrity (NON-NEGOTIABLE)

**MUST**:
- All API endpoints MUST be defined in OpenAPI 3.1 schema via chanfana decorators
- Breaking changes MUST increment MAJOR version (e.g., 1.x.x → 2.0.0)
- New endpoints or fields MUST increment MINOR version (e.g., 1.2.x → 1.3.0)
- Bug fixes or clarifications MUST increment PATCH version (e.g., 1.2.3 → 1.2.4)
- All changes MUST update `openapi.json` automatically (validated in CI/CD pipeline)

**MUST NOT**:
- Remove or rename fields without a MAJOR version bump
- Change field types without a MAJOR version bump
- Deploy API changes without verifying frontend compatibility

**Rationale**: API contract violations break the frontend-backend integration. Strict versioning ensures safe deployments and clear communication about breaking changes. Essential for Cloudflare Workers edge deployment reliability.

---

### IV. User Experience Consistency

**MUST**:
- All interactive elements MUST provide visual feedback (hover, active, focus states)
- Forms MUST validate input with clear error messages positioned near fields
- All user-facing text MUST use consistent terminology (e.g., "sighting" not "observation" then "record")
- Loading states MUST be indicated for operations exceeding 200ms
- Accessibility attributes MUST be present (`aria-label`, `aria-labelledby` for screen readers)

**MUST NOT**:
- Introduce new color schemes without documenting in design system
- Use inconsistent spacing/sizing (stick to 4px/8px grid system)
- Disable buttons without explaining why via tooltip or helper text

**Rationale**: Wildlife enthusiasts expect a polished, predictable experience. Consistency builds trust and reduces cognitive load when documenting animal sightings across multiple sessions.

---

### V. Progressive Enhancement

**MUST**:
- Critical user journeys (view sightings, submit basic record) MUST degrade gracefully
- Images MUST include `alt` text describing wildlife content

**MUST NOT**:
- Show blank pages when JavaScript fails to load

**Rationale**: Field researchers may have limited connectivity or older devices. Progressive enhancement ensures usability in adverse conditions (remote wildlife areas with poor network).

---

### VI. Developer Simplicity

**MUST**:
- Configuration files MUST include inline comments explaining non-obvious settings
- Error messages MUST include actionable next steps (e.g., "Run `npm install` to resolve")
- README files MUST provide one-command setup: `npm install && npm dev`

**MUST NOT**:
- Add frameworks/libraries duplicating existing functionality
- Add ANY framework/library/dependancy without FIRST asking for permission
- Use build tools requiring global installations (prefer project-local binaries)

**Rationale**: Simple tooling lowers onboarding friction and reduces maintenance burden. Critical for open-source contributors and solo developers managing both frontend and backend stacks.

---

## Quality Standards

### Code Review Requirements

All code changes MUST:
- Pass TypeScript compilation without errors
- Pass linting rules (ESLint for frontend, TypeScript compiler for backend)
- Include updated tests if modifying existing functionality
- Update OpenAPI schema if API contracts change

### Testing Expectations

Tests are NOT created EVER

### Performance Benchmarks

- Frontend bundle size MUST NOT exceed 500KB gzipped
- Lighthouse accessibility score MUST remain ≥90
- First Contentful Paint MUST be ≤1.5s on 3G networks

---

## Development Workflow

### Branching Strategy

- `main` branch contains production-ready code
- Feature branches follow pattern: `###-feature-name` (e.g., `042-photo-upload`)
- Always start a new implementation by creating a feature branch and switching to it.
- Hotfix branches use `hotfix-###` pattern

### Deployment Gates

Before deploying to production:
- Cloudflare Worker MUST pass `wrangler deploy --dry-run` validation
- Frontend MUST build successfully via `pnpm build`
- Smoke test MUST verify: homepage loads, API health endpoint responds

---

## Governance

This constitution supersedes all informal practices. When in doubt, constitution principles take precedence over convenience.

**Amendment Process**:
1. Propose changes via pull request modifying this file
2. Document impact on existing code/templates in PR description
3. Update dependent templates (plan/spec/tasks) in same PR
4. Increment constitution version following semantic versioning rules
5. Add sync impact report as HTML comment at top of file

**Compliance Verification**:
- All feature specifications MUST include "Constitution Check" section (see `plan-template.md`)
- Complexity exceptions MUST be justified in writing (documented in plan.md)
- Violations found in code review MUST be addressed before merge or explicitly waived with rationale

**Living Document**:
- Review constitution quarterly or after major architecture changes
- Outdated principles MUST be removed, not left as "legacy guidelines"
- Use `.specify/templates/commands/` for agent-specific runtime guidance

---

**Version**: 1.0.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
