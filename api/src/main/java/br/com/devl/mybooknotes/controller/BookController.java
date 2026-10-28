package br.com.devl.mybooknotes.controller;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<PagedModel<BookResponseDTO>> listBooks(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        var books = service.listBooks(pageable);
        return ResponseEntity.ok(new PagedModel<>(books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> findBookById(@PathVariable UUID id) {
        var book = service.findBookById(id);
        return ResponseEntity.ok(book);
    }


    @PostMapping()
    public ResponseEntity<BookResponseDTO> createBook(@Valid @RequestBody BookRequestDTO bookRequest) {
        var result = service.createBook(bookRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable UUID id, @Valid @RequestBody BookRequestDTO request) {
        var updatedBook = service.updateBook(id, request);
        return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookById(@PathVariable UUID id) {
        service.deleteBookById(id);
        return ResponseEntity.noContent().build();
    }

}
