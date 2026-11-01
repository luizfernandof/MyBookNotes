package br.com.devl.mybooknotes;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@Import(TestcontainersConfig.class)
@AutoConfigureMockMvc
class BookSearchAndMetricsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String newUser() throws Exception {
        var credentials = "{\"email\": \"user-%s@example.com\", \"password\": \"senha-segura-123\"}".formatted(UUID.randomUUID());
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(credentials))
            .andExpect(status().isCreated());
        var result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(credentials))
            .andExpect(status().isOk())
            .andReturn();
        return "Bearer " + JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    private void createBook(String token, String title, String author, Integer rate, String finishedAt, String status) throws Exception {
        var body = "{\"title\": \"%s\", \"author\": \"%s\", \"rate\": %s, \"finishedAt\": %s, \"status\": \"%s\"}".formatted(
            title, author, rate, finishedAt == null ? "null" : "\"" + finishedAt + "\"", status);
        mockMvc.perform(post("/api/books").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated());
    }

    @Test
    void searchIgnoresCaseAndAccentsAndCombinesFilters() throws Exception {
        var token = newUser();
        createBook(token, "Memórias Póstumas", "Machado de Assis", 5, null, "READ");
        createBook(token, "Iracema", "José de Alencar", 3, null, "READ");
        createBook(token, "100% Humano", "Autora", 4, null, "READING");

        mockMvc.perform(get("/api/books").param("q", "  MEMORIAS ").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(jsonPath("$.content[*].title", contains("Memórias Póstumas")));
        mockMvc.perform(get("/api/books").param("q", "jose").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(jsonPath("$.content[*].title", contains("Iracema")));
        mockMvc.perform(get("/api/books").param("q", "%").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(jsonPath("$.content[*].title", contains("100% Humano")));
        mockMvc.perform(get("/api/books").param("status", "READ").param("minRate", "4").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(jsonPath("$.content[*].title", contains("Memórias Póstumas")));
    }

    @Test
    void searchDoesNotReturnBooksFromOtherUsers() throws Exception {
        var owner = newUser();
        createBook(owner, "Livro secreto", "Autor", null, null, "READ");

        mockMvc.perform(get("/api/books").param("q", "secreto").header(HttpHeaders.AUTHORIZATION, newUser()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    void metricsAggregateOnlyTheUsersBooks() throws Exception {
        var token = newUser();
        createBook(token, "A", "Machado", 5, "2024-01-10", "READ");
        createBook(token, "B", "Machado", 2, "2024-01-20", "READ");
        createBook(token, "C", "Clarice", 4, "2024-12-31", "READ");
        createBook(token, "D", "Clarice", null, "2023-06-01", "READ");
        createBook(token, "E", "Clarice", null, null, "READ");
        createBook(token, "F", "Outro", null, "2024-03-01", "DROPPED");
        createBook(newUser(), "Alheio", "Alheio", 1, "2024-01-01", "READ");

        mockMvc.perform(get("/api/metrics").param("year", "2024").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.year").value(2024))
            .andExpect(jsonPath("$.totalBooks").value(6))
            .andExpect(jsonPath("$.booksByStatus.READ").value(5))
            .andExpect(jsonPath("$.booksByStatus.DROPPED").value(1))
            .andExpect(jsonPath("$.booksByStatus.READING").value(0))
            .andExpect(jsonPath("$.averageRate").value(11.0 / 3))
            .andExpect(jsonPath("$.rateDistribution[*].rate", contains(2, 4, 5)))
            .andExpect(jsonPath("$.readInYear").value(3))
            .andExpect(jsonPath("$.readByMonth", contains(2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)))
            .andExpect(jsonPath("$.readByYear[*].year", contains(2024, 2023)))
            .andExpect(jsonPath("$.readByYear[*].count", contains(3, 1)))
            .andExpect(jsonPath("$.readWithoutDate").value(1))
            .andExpect(jsonPath("$.topAuthors[*].author", contains("Clarice", "Machado")))
            .andExpect(jsonPath("$.goalTarget", nullValue()));
    }

    @Test
    void metricsOfUserWithoutBooksAreEmpty() throws Exception {
        mockMvc.perform(get("/api/metrics").header(HttpHeaders.AUTHORIZATION, newUser()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalBooks").value(0))
            .andExpect(jsonPath("$.averageRate", nullValue()))
            .andExpect(jsonPath("$.readByMonth", hasSize(12)));
    }

    @Test
    void goalCanBeCreatedReplacedAndDeleted() throws Exception {
        var token = newUser();

        for (var target : new int[] { 12, 24 }) {
            mockMvc.perform(put("/api/metrics/goals/2024").header(HttpHeaders.AUTHORIZATION, token)
                    .contentType(MediaType.APPLICATION_JSON).content("{\"target\": %d}".formatted(target)))
                .andExpect(status().isNoContent());
        }
        mockMvc.perform(get("/api/metrics").param("year", "2024").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(jsonPath("$.goalTarget").value(24));
        mockMvc.perform(get("/api/metrics").param("year", "2023").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(jsonPath("$.goalTarget", nullValue()));

        mockMvc.perform(delete("/api/metrics/goals/2024").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/metrics").param("year", "2024").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(jsonPath("$.goalTarget", nullValue()));
    }

    @Test
    void metricsValidateInputAndRequireAuthentication() throws Exception {
        var token = newUser();

        mockMvc.perform(get("/api/metrics")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/metrics").param("year", "99999").header(HttpHeaders.AUTHORIZATION, token))
            .andExpect(status().isBadRequest());
        mockMvc.perform(put("/api/metrics/goals/2024").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"target\": 0}"))
            .andExpect(status().isBadRequest());
    }

}
