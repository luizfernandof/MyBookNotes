package br.com.devl.mybooknotes.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.devl.mybooknotes.dto.BookRequestDTO;
import br.com.devl.mybooknotes.dto.BookResponseDTO;
import br.com.devl.mybooknotes.model.Book;
import br.com.devl.mybooknotes.repository.BookRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class BookService {

    private final BookRepository repository;
    public BookService(BookRepository repository) { this.repository = repository; }

    public BookResponseDTO findBookById(UUID id) {
        return BookResponseDTO.fromEntity(findOrThrow(id));
    }

    public Page<BookResponseDTO> listBooks(Pageable pageable) {
        return repository.findAll(pageable).map(BookResponseDTO::fromEntity);
    }

    public BookResponseDTO createBook(BookRequestDTO request) {
        var book = request.toEntity();
        var savedBook = repository.save(book);
        return BookResponseDTO.fromEntity(savedBook);
    }

    public BookResponseDTO updateBook(UUID id, BookRequestDTO request) {
        var book = findOrThrow(id);
        request.updateEntity(book);
        var savedBook = repository.save(book);
        return BookResponseDTO.fromEntity(savedBook);
    }

    public void deleteBookById(UUID id) {
        repository.delete(findOrThrow(id));
    }

    private Book findOrThrow(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Livro não encontrado!..."));
    }

}
