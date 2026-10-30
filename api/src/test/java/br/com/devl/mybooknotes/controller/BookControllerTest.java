package br.com.devl.mybooknotes.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.com.devl.mybooknotes.config.SecurityConfig;
import br.com.devl.mybooknotes.dto.BookRequestDTO;
import br.com.devl.mybooknotes.dto.BookResponseDTO;
import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.service.BookService;
import jakarta.persistence.EntityNotFoundException;

@WebMvcTest(BookController.class)
@Import(SecurityConfig.class)
class BookControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();

    private static final String VALID_BODY = """
        {"title": "Dom Casmurro", "author": "Machado de Assis", "rate": 5, "status": "READ"}
        """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    private static JwtRequestPostProcessor user() {
        return jwt().jwt(token -> token.subject(USER_ID.toString()));
    }

    private BookResponseDTO response(UUID id) {
        return new BookResponseDTO(id, "Dom Casmurro", "Machado de Assis", 5, null, null, null, null, ReadingStatus.READ);
    }

    @Test
    void requestWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/books"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listBooksReturnsPage() throws Exception {
        when(service.listBooks(eq(USER_ID), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(response(UUID.randomUUID()))));

        mockMvc.perform(get("/api/books").with(user()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].title").value("Dom Casmurro"))
            .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void listBooksReturns400ForUnknownSortField() throws Exception {
        mockMvc.perform(get("/api/books").param("sort", "xyz").with(user()))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value("Não é possível ordenar por: xyz"));
    }

    @Test
    void listBooksReturns400WhenSortingByOwnerData() throws Exception {
        mockMvc.perform(get("/api/books").param("sort", "owner.passwordHash").with(user()))
            .andExpect(status().isBadRequest());
    }

    @Test
    void findBookByIdReturns404WhenMissing() throws Exception {
        var id = UUID.randomUUID();
        when(service.findBookById(USER_ID, id)).thenThrow(new EntityNotFoundException("Livro não encontrado!..."));

        mockMvc.perform(get("/api/books/{id}", id).with(user()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Livro não encontrado!..."));
    }

    @Test
    void createBookReturns201() throws Exception {
        var id = UUID.randomUUID();
        when(service.createBook(eq(USER_ID), any(BookRequestDTO.class))).thenReturn(response(id));

        mockMvc.perform(post("/api/books").with(user()).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void createBookReturns400WhenInvalid() throws Exception {
        var body = """
            {"title": "", "author": "Machado de Assis", "rate": 10}
            """;

        mockMvc.perform(post("/api/books").with(user()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.title").exists())
            .andExpect(jsonPath("$.errors.rate").exists())
            .andExpect(jsonPath("$.errors.status").exists());
    }

    @Test
    void createBookReturns400WhenTextContainsNullCharacter() throws Exception {
        var body = """
            {"title": "a\\u0000b", "author": "Autor", "summary": "c\\u0000d", "coverUrl": "e\\u0000f", "status": "READ"}
            """;

        mockMvc.perform(post("/api/books").with(user()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.title").exists())
            .andExpect(jsonPath("$.errors.summary").exists())
            .andExpect(jsonPath("$.errors.coverUrl").exists());
    }

    @Test
    void updateBookReturns200() throws Exception {
        var id = UUID.randomUUID();
        when(service.updateBook(eq(USER_ID), eq(id), any(BookRequestDTO.class))).thenReturn(response(id));

        mockMvc.perform(put("/api/books/{id}", id).with(user()).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
            .andExpect(status().isOk());
    }

    @Test
    void deleteBookReturns404WhenMissing() throws Exception {
        var id = UUID.randomUUID();
        doThrow(new EntityNotFoundException("Livro não encontrado!...")).when(service).deleteBookById(USER_ID, id);

        mockMvc.perform(delete("/api/books/{id}", id).with(user()))
            .andExpect(status().isNotFound());
    }

}
