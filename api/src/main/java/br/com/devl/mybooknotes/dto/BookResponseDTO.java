package br.com.devl.mybooknotes.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.model.Book;

public record BookResponseDTO(
    UUID id,
    String title, 
    String author, 
    Integer rate,
    String summary,
    LocalDateTime createdAt,
    LocalDate finishedAt,
    String coverUrl,
    ReadingStatus status
) 
{
    public static BookResponseDTO fromEntity(Book book) {
        return new BookResponseDTO(
            book.getId(),
            book.getTitle(), 
            book.getAuthor(), 
            book.getRate(),
            book.getSummary(),
            book.getCreatedAt(),
            book.getFinishedAt(),
            book.getCoverUrl(),
            book.getStatus());
    }
}