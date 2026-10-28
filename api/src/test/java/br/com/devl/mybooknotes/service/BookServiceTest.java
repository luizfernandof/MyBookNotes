package br.com.devl.mybooknotes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import br.com.devl.mybooknotes.dto.BookRequestDTO;
import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.model.Book;
import br.com.devl.mybooknotes.repository.BookRepository;
import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository repository;

    @InjectMocks
    private BookService service;

    private BookRequestDTO request() {
        return new BookRequestDTO("Dom Casmurro", "Machado de Assis", 5, "Resumo", null, null, ReadingStatus.READ);
    }

    private Book book(UUID id) {
        var book = request().toEntity();
        book.setId(id);
        return book;
    }

    @Test
    void findBookByIdReturnsBook() {
        var id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(book(id)));

        var result = service.findBookById(id);

        assertThat(result.id()).isEqualTo(id);
        assertThat(result.title()).isEqualTo("Dom Casmurro");
    }

    @Test
    void findBookByIdThrowsWhenMissing() {
        var id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findBookById(id)).isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void listBooksMapsPage() {
        var pageable = PageRequest.of(0, 10);
        when(repository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(book(UUID.randomUUID())), pageable, 1));

        var result = service.listBooks(pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).author()).isEqualTo("Machado de Assis");
    }

    @Test
    void createBookSavesEntity() {
        var id = UUID.randomUUID();
        when(repository.save(any(Book.class))).thenReturn(book(id));

        var result = service.createBook(request());

        assertThat(result.id()).isEqualTo(id);
    }

    @Test
    void updateBookAppliesChanges() {
        var id = UUID.randomUUID();
        var existing = book(id);
        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        var changes = new BookRequestDTO("Novo título", "Outro autor", 3, null, null, null, ReadingStatus.READING);
        var result = service.updateBook(id, changes);

        assertThat(result.title()).isEqualTo("Novo título");
        assertThat(result.status()).isEqualTo(ReadingStatus.READING);
    }

    @Test
    void deleteBookThrowsWhenMissing() {
        var id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteBookById(id)).isInstanceOf(EntityNotFoundException.class);
        verify(repository, never()).delete(any());
    }

}
