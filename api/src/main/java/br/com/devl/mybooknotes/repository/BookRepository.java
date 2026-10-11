package br.com.devl.mybooknotes.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.devl.mybooknotes.model.Book;

public interface BookRepository extends JpaRepository<Book, UUID> {

}
