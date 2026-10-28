package br.com.devl.mybooknotes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.jayway.jsonpath.JsonPath;

import br.com.devl.mybooknotes.controller.AuthController;
import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

    private static final String PASSWORD = "senha-segura-123";

    @Autowired
    private MockMvc mockMvc;

    private record Session(String accessToken, String refreshToken) {}

    private String newEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    private void register(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"%s\", \"password\": \"%s\"}".formatted(email, PASSWORD)))
            .andExpect(status().isCreated());
    }

    private Session login(String email) throws Exception {
        var result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"%s\", \"password\": \"%s\"}".formatted(email, PASSWORD)))
            .andExpect(status().isOk())
            .andReturn();
        return session(result);
    }

    private Session registerAndLogin() throws Exception {
        var email = newEmail();
        register(email);
        return login(email);
    }

    private MvcResult refresh(String refreshToken) throws Exception {
        return mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie(AuthController.REFRESH_COOKIE, refreshToken)))
            .andReturn();
    }

    private Session session(MvcResult result) throws Exception {
        String accessToken = JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
        var cookie = result.getResponse().getCookie(AuthController.REFRESH_COOKIE);
        return new Session(accessToken, cookie.getValue());
    }

    private String createBook(String accessToken) throws Exception {
        var result = mockMvc.perform(post("/api/books").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\": \"Dom Casmurro\", \"author\": \"Machado de Assis\", \"status\": \"READ\"}"))
            .andExpect(status().isCreated())
            .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        var email = newEmail();
        register(email);

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"%s\", \"password\": \"%s\"}".formatted(email.toUpperCase(), PASSWORD)))
            .andExpect(status().isConflict());
    }

    @Test
    void registerRejectsInvalidData() throws Exception {
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"nao-e-email\", \"password\": \"curta\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.email").exists())
            .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void loginRejectsWrongPasswordAndUnknownEmailTheSameWay() throws Exception {
        var email = newEmail();
        register(email);

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"%s\", \"password\": \"senha-errada\"}".formatted(email)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos"));

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"%s\", \"password\": \"%s\"}".formatted(newEmail(), PASSWORD)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos"));
    }

    @Test
    void loginSetsSecureRefreshCookie() throws Exception {
        var email = newEmail();
        register(email);

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"%s\", \"password\": \"%s\"}".formatted(email, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.refreshToken").doesNotExist())
            .andExpect(header().string(HttpHeaders.SET_COOKIE, allOf(
                containsString("HttpOnly"),
                containsString("Secure"),
                containsString("SameSite=Strict"),
                containsString("Path=/api/auth"))));
    }

    @Test
    void invalidAccessTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/books").header(HttpHeaders.AUTHORIZATION, "Bearer token.invalido.aqui"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void userCannotSeeOrChangeAnotherUsersBooks() throws Exception {
        var alice = registerAndLogin();
        var bob = registerAndLogin();
        var aliceBookId = createBook(alice.accessToken());

        mockMvc.perform(get("/api/books/{id}", aliceBookId).header(HttpHeaders.AUTHORIZATION, "Bearer " + bob.accessToken()))
            .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/books/{id}", aliceBookId).header(HttpHeaders.AUTHORIZATION, "Bearer " + bob.accessToken()))
            .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/books").header(HttpHeaders.AUTHORIZATION, "Bearer " + bob.accessToken()))
            .andExpect(jsonPath("$.page.totalElements").value(0));

        mockMvc.perform(get("/api/books/{id}", aliceBookId).header(HttpHeaders.AUTHORIZATION, "Bearer " + alice.accessToken()))
            .andExpect(status().isOk());
    }

    @Test
    void refreshRotatesTokenAndNewAccessTokenWorks() throws Exception {
        var first = registerAndLogin();

        var result = refresh(first.refreshToken());
        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        var second = session(result);

        assertThat(second.refreshToken()).isNotEqualTo(first.refreshToken());
        mockMvc.perform(get("/api/books").header(HttpHeaders.AUTHORIZATION, "Bearer " + second.accessToken()))
            .andExpect(status().isOk());
    }

    @Test
    void reusingOldRefreshTokenRevokesWholeFamily() throws Exception {
        var first = registerAndLogin();
        var second = session(refresh(first.refreshToken()));

        // Atacante reapresenta o token antigo: rejeitado...
        assertThat(refresh(first.refreshToken()).getResponse().getStatus()).isEqualTo(401);
        // ...e o token legítimo mais recente também deixa de valer
        assertThat(refresh(second.refreshToken()).getResponse().getStatus()).isEqualTo(401);
    }

    @Test
    void reuseDetectionDoesNotAffectOtherSessions() throws Exception {
        var email = newEmail();
        register(email);
        var laptop = login(email);
        var phone = login(email);

        refresh(laptop.refreshToken());
        refresh(laptop.refreshToken());

        assertThat(refresh(phone.refreshToken()).getResponse().getStatus()).isEqualTo(200);
    }

    @Test
    void logoutRevokesRefreshToken() throws Exception {
        var session = registerAndLogin();

        mockMvc.perform(post("/api/auth/logout").cookie(new Cookie(AuthController.REFRESH_COOKIE, session.refreshToken())))
            .andExpect(status().isNoContent())
            .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));

        assertThat(refresh(session.refreshToken()).getResponse().getStatus()).isEqualTo(401);
    }

    @Test
    void refreshWithoutCookieReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
            .andExpect(status().isUnauthorized());
    }

}
