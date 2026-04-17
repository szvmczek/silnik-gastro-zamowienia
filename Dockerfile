# Multi-stage Dockerfile - pelna implementacja w Fazie 5.
#
# Stage 1: build frontend (Node 20)
#   cd frontend && npm ci && npm run build -> dist/
#
# Stage 2: build backend (Gradle + JDK 21)
#   skopiuj frontend/dist -> backend/src/main/resources/static/
#   ./gradlew bootJar
#
# Stage 3: runtime (Eclipse Temurin 21 JRE)
#   COPY bootJar -> /app.jar
#   ENTRYPOINT ["java", "-jar", "/app.jar"]
#
# Nie implementuj teraz - to faza 5.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
CMD ["echo", "Dockerfile placeholder - implement in Phase 5"]
