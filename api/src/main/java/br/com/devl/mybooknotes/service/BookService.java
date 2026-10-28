package br.com.devl.mybooknotes.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.devl.mybooknotes.dto.BookRequestDTO;
import br.com.devl.mybooknotes.dto.BookResponseDTO;
import br.com.devl.mybooknotes.model.Book;
import br.com.devl.mybooknotes.repository.BookRepository;
import br.com.devl.mybooknotes.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;

// Toda operação é filtrada pelo dono: o livro de outro usuário é tratado como inexistente (404)
@Service
public class BookService {

    private final BookRepository repository;
    private final UserRepository userRepository;

    public BookService(BookRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public BookResponseDTO findBookById(UUID userId, UUID id) {
        return BookResponseDTO.fromEntity(findOrThrow(userId, id));
    }

    public Page<BookResponseDTO> listBooks(UUID userId, Pageable pageable) {
        return repository.findAllByOwnerId(userId, pageable).map(BookResponseDTO::fromEntity);
    }

    public BookResponseDTO createBook(UUID userId, BookRequestDTO request) {
        var book = request.toEntity();
        book.setOwner(userRepository.getReferenceById(userId));
        var savedBook = repository.save(book);
        return BookResponseDTO.fromEntity(savedBook);
    }

    public BookResponseDTO updateBook(UUID userId, UUID id, BookRequestDTO request) {
        var book = findOrThrow(userId, id);
        request.updateEntity(book);
        var savedBook = repository.save(book);
        return BookResponseDTO.fromEntity(savedBook);
    }

    public void deleteBookById(UUID userId, UUID id) {
        repository.delete(findOrThrow(userId, id));
    }

    private Book findOrThrow(UUID userId, UUID id) {
        return repository.findByIdAndOwnerId(id, userId)
            .orElseThrow(() -> new EntityNotFoundException("Livro não encontrado!..."));
    }

}
