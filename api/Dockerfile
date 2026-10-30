FROM eclipse-temurin:17-jdk AS build
WORKDIR /src
COPY mvnw pom.xml ./
COPY .mvn .mvn
# Camada separada: as dependências só são baixadas de novo quando o pom.xml muda
RUN ./mvnw -B -q dependency:go-offline
COPY src src
# Os testes rodam antes do deploy, com ./mvnw test
RUN ./mvnw -B -q -DskipTests package && mv target/mybooknotes-*.jar /src/app.jar

FROM eclipse-temurin:17-jre
RUN useradd --system --uid 1001 --no-create-home spring
WORKDIR /app
COPY --from=build /src/app.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
