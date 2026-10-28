package br.com.devl.mybooknotes.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.com.devl.mybooknotes.dto.BookRequestDTO;
import br.com.devl.mybooknotes.dto.BookResponseDTO;
import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.service.BookService;
import jakarta.persistence.EntityNotFoundException;

@WebMvcTest(BookController.class)
class BookControllerTest {

    private static final String VALID_BODY = """
        {"title": "Dom Casmurro", "author": "Machado de Assis", "rate": 5, "status": "READ"}
        """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService service;

    private BookResponseDTO response(UUID id) {
        return new BookResponseDTO(id, "Dom Casmurro", "Machado de Assis", 5, null, null, null, null, ReadingStatus.READ);
    }

    @Test
    void listBooksReturnsPage() throws Exception {
        when(service.listBooks(any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(response(UUID.randomUUID()))));

        mockMvc.perform(get("/api/books"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].title").value("Dom Casmurro"))
            .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void findBookByIdReturns404WhenMissing() throws Exception {
        var id = UUID.randomUUID();
        when(service.findBookById(id)).thenThrow(new EntityNotFoundException("Livro não encontrado!..."));

        mockMvc.perform(get("/api/books/{id}", id))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Livro não encontrado!..."));
    }

    @Test
    void createBookReturns201() throws Exception {
        var id = UUID.randomUUID();
        when(service.createBook(any(BookRequestDTO.class))).thenReturn(response(id));

        mockMvc.perform(post("/api/books").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void createBookReturns400WhenInvalid() throws Exception {
        var body = """
            {"title": "", "author": "Machado de Assis", "rate": 10}
            """;

        mockMvc.perform(post("/api/books").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.title").exists())
            .andExpect(jsonPath("$.errors.rate").exists())
            .andExpect(jsonPath("$.errors.status").exists());
    }

    @Test
    void updateBookReturns200() throws Exception {
        var id = UUID.randomUUID();
        when(service.updateBook(eq(id), any(BookRequestDTO.class))).thenReturn(response(id));

        mockMvc.perform(put("/api/books/{id}", id).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
            .andExpect(status().isOk());
    }

    @Test
    void deleteBookReturns404WhenMissing() throws Exception {
        var id = UUID.randomUUID();
        doThrow(new EntityNotFoundException("Livro não encontrado!...")).when(service).deleteBookById(id);

        mockMvc.perform(delete("/api/books/{id}", id))
            .andExpect(status().isNotFound());
    }

}
