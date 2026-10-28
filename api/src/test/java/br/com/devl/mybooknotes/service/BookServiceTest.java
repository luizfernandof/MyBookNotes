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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import br.com.devl.mybooknotes.dto.BookRequestDTO;
import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.model.Book;
import br.com.devl.mybooknotes.model.User;
import br.com.devl.mybooknotes.repository.BookRepository;
import br.com.devl.mybooknotes.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private BookRepository repository;

    @Mock
    private UserRepository userRepository;

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
        when(repository.findByIdAndOwnerId(id, USER_ID)).thenReturn(Optional.of(book(id)));

        var result = service.findBookById(USER_ID, id);

        assertThat(result.id()).isEqualTo(id);
        assertThat(result.title()).isEqualTo("Dom Casmurro");
    }

    @Test
    void findBookByIdThrowsWhenMissingOrOwnedByAnotherUser() {
        var id = UUID.randomUUID();
        when(repository.findByIdAndOwnerId(id, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findBookById(USER_ID, id)).isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void listBooksMapsPage() {
        var pageable = PageRequest.of(0, 10);
        when(repository.findAllByOwnerId(USER_ID, pageable))
            .thenReturn(new PageImpl<>(List.of(book(UUID.randomUUID())), pageable, 1));

        var result = service.listBooks(USER_ID, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).author()).isEqualTo("Machado de Assis");
    }

    @Test
    void createBookSetsOwnerFromUserId() {
        var owner = new User();
        owner.setId(USER_ID);
        when(userRepository.getReferenceById(USER_ID)).thenReturn(owner);
        when(repository.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.createBook(USER_ID, request());

        var captor = ArgumentCaptor.forClass(Book.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getOwner()).isSameAs(owner);
    }

    @Test
    void updateBookAppliesChanges() {
        var id = UUID.randomUUID();
        var existing = book(id);
        when(repository.findByIdAndOwnerId(id, USER_ID)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        var changes = new BookRequestDTO("Novo título", "Outro autor", 3, null, null, null, ReadingStatus.READING);
        var result = service.updateBook(USER_ID, id, changes);

        assertThat(result.title()).isEqualTo("Novo título");
        assertThat(result.status()).isEqualTo(ReadingStatus.READING);
    }

    @Test
    void deleteBookThrowsWhenMissing() {
        var id = UUID.randomUUID();
        when(repository.findByIdAndOwnerId(id, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteBookById(USER_ID, id)).isInstanceOf(EntityNotFoundException.class);
        verify(repository, never()).delete(any());
    }

}
