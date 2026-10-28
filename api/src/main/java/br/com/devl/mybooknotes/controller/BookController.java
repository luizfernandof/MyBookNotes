package br.com.devl.mybooknotes.controller;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.devl.mybooknotes.dto.BookRequestDTO;
import br.com.devl.mybooknotes.dto.BookResponseDTO;
import br.com.devl.mybooknotes.service.BookService;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping()
    public ResponseEntity<PagedModel<BookResponseDTO>> listBooks(@AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        var books = service.listBooks(userId(jwt), pageable);
        return ResponseEntity.ok(new PagedModel<>(books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> findBookById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        var book = service.findBookById(userId(jwt), id);
        return ResponseEntity.ok(book);
    }


    @PostMapping()
    public ResponseEntity<BookResponseDTO> createBook(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody BookRequestDTO bookRequest) {
        var result = service.createBook(userId(jwt), bookRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody BookRequestDTO request) {
        var updatedBook = service.updateBook(userId(jwt), id, request);
        return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.deleteBookById(userId(jwt), id);
        return ResponseEntity.noContent().build();
    }

    // O dono vem sempre do token (claim "sub"), nunca do corpo da requisição
    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

}
