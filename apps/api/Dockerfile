FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY apps/api/.mvn .mvn
COPY apps/api/mvnw apps/api/pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline
COPY apps/api/src src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
