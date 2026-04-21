# syntax=docker/dockerfile:1.7

# --- Stage 1: frontend build (Vite) ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# --- Stage 2: backend build (Spring Boot fat jar) ---
FROM eclipse-temurin:21-jdk-jammy AS backend-build
WORKDIR /app
COPY backend/ ./backend/
# Repo uzywa CRLF (Windows) — strip \r zeby ./gradlew dzialalo w Linux shellu.
RUN sed -i 's/\r$//' ./backend/gradlew && chmod +x ./backend/gradlew
# Frontend dist ladowany do classpath:/static/ przed bootJar.
COPY --from=frontend-build /app/frontend/dist ./backend/src/main/resources/static
WORKDIR /app/backend
RUN ./gradlew bootJar --no-daemon -x test

# --- Stage 3: runtime (minimal JRE + curl dla HEALTHCHECK) ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r app && useradd -r -g app app
COPY --from=backend-build /app/backend/build/libs/*.jar /app/app.jar
RUN chown app:app /app/app.jar
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fs http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
