package br.com.devl.mybooknotes.dto;

import java.time.LocalDate;

import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.model.Book;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookRequestDTO(
        @NotBlank String title,
        @NotBlank String author,
        @Min(0) @Max(5) Integer rate,
        String summary,
        LocalDate finishedAt,
        String coverUrl,
        @NotNull ReadingStatus status)
{
    public Book toEntity() {
        var book = new Book();
        updateEntity(book);
        return book;
    }

    public void updateEntity(Book book) {
        book.setTitle(this.title());
        book.setAuthor(this.author());
        book.setRate(this.rate());
        book.setSummary(this.summary());
        book.setFinishedAt(this.finishedAt());
        book.setCoverUrl(this.coverUrl());
        book.setStatus(this.status());
    }
}
