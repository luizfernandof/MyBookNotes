package br.com.devl.mybooknotes.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
        var book = repository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Livro não encontrado!..."));
        return BookResponseDTO.fromEntity(book);
    }
    
    public List<BookResponseDTO> listBooks() {
        var books = repository.findAll();
        List<BookResponseDTO> bookResponses = new ArrayList<>();
        for (Book book : books) {
            var bookDTO = BookResponseDTO.fromEntity(book);
            bookResponses.add(bookDTO);
        }
        return bookResponses;
    }

    public BookResponseDTO createBook(BookRequestDTO request) {
        var book = request.toEntity();
        var savedBook = repository.save(book);
        return BookResponseDTO.fromEntity(savedBook);
    }


    public BookResponseDTO updateBook(UUID id, BookRequestDTO request) {
        var book = repository.findById(id).orElseThrow(
            () -> new EntityNotFoundException("Livro não encontrado!...")
        );
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setRate(request.rate());
        book.setSummary(request.summary());
        book.setFinishedAt(request.finishedAt());
        book.setCoverUrl(request.coverUrl());
        book.setStatus(request.status());
        repository.save(book);
        return BookResponseDTO.fromEntity(book);
    }

    public void deleteBookById(UUID id) {
        var book = repository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Livro não encontrado!..."));
        repository.delete(book);
    }

}
