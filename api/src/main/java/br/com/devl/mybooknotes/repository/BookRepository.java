package br.com.devl.mybooknotes.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.devl.mybooknotes.model.Book;

public interface BookRepository extends JpaRepository<Book, UUID> {

    Page<Book> findAllByOwnerId(UUID ownerId, Pageable pageable);

    Optional<Book> findByIdAndOwnerId(UUID id, UUID ownerId);

}
