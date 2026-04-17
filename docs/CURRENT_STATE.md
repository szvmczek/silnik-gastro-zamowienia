# CURRENT_STATE.md

Snapshot stanu projektu. Aktualizowany przez Claude Code na koniec każdej fazy.

## Faza aktualnie w toku
Brak. Bootstrap zakończony, oczekiwanie na prompt Fazy 1.

## Fazy ukończone
- [x] Faza 0: Bootstrap
  - Pliki konstytucyjne: /CLAUDE.md, /docs/*.md
  - Backend: Spring Boot 3 + Java 21, skeleton, Gradle Kotlin DSL, migracja
    V1 pusta, endpoint /api/ping
  - Frontend: Vite + React + TS, Tailwind, shadcn/ui init, placeholder
    landing i admin login, routing
  - Infra: docker-compose z Postgres 16 + Adminer, .env.example,
    .gitignore, Dockerfile placeholder
  - Git: repo zainicjowane, pierwszy commit

## Fazy zaplanowane
- [ ] Faza 1: Auth + Settings + Theme
- [ ] Faza 2: Menu
- [ ] Faza 3: Cart + Checkout + Order + Tracking
- [ ] Faza 4: Admin Orders + polling (SSE stretch)
- [ ] Faza 5: Polish + Deploy

## Aktualne ostrzeżenia / tech debt świadomie zaakceptowany
Brak na tym etapie. Pierwsze wpisy pojawią się po Fazie 1.

## Następne kroki
Użytkownik wkleja prompt Fazy 1 z OPERATOR_PLAYBOOK.md.
