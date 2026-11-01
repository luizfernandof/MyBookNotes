package br.com.devl.mybooknotes.dto;

import java.util.List;
import java.util.Map;

import br.com.devl.mybooknotes.enums.ReadingStatus;

public record MetricsResponseDTO(
    int year,
    long totalBooks,
    Map<ReadingStatus, Long> booksByStatus,
    Double averageRate,
    List<RateCount> rateDistribution,
    List<YearCount> readByYear,
    List<Long> readByMonth,
    long readInYear,
    Integer goalTarget,
    long readWithoutDate,
    List<AuthorCount> topAuthors)
{
    public record RateCount(int rate, long count) {}

    public record YearCount(int year, long count) {}

    public record AuthorCount(String author, long count) {}
}
