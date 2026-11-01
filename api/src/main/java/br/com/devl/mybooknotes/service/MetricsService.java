package br.com.devl.mybooknotes.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.devl.mybooknotes.dto.MetricsResponseDTO;
import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.model.ReadingGoal;
import br.com.devl.mybooknotes.repository.BookRepository;
import br.com.devl.mybooknotes.repository.ReadingGoalRepository;

@Service
public class MetricsService {

    private static final int TOP_AUTHORS = 5;

    private final BookRepository books;
    private final ReadingGoalRepository goals;

    public MetricsService(BookRepository books, ReadingGoalRepository goals) {
        this.books = books;
        this.goals = goals;
    }

    // Só contam como lidos os livros com status READ; os sem data de término não entram em ano nem mês
    @Transactional(readOnly = true)
    public MetricsResponseDTO getMetrics(UUID userId, int year) {
        var byStatus = new EnumMap<ReadingStatus, Long>(ReadingStatus.class);
        for (var status : ReadingStatus.values()) {
            byStatus.put(status, 0L);
        }
        books.groupByStatus(userId).forEach(group -> byStatus.put(group.getGroupKey(), group.getTotal()));
        long total = byStatus.values().stream().mapToLong(Long::longValue).sum();

        var rates = books.groupByRate(userId).stream()
            .map(group -> new MetricsResponseDTO.RateCount(group.getGroupKey(), group.getTotal()))
            .toList();
        long rated = rates.stream().mapToLong(MetricsResponseDTO.RateCount::count).sum();
        long rateSum = rates.stream().mapToLong(rate -> rate.rate() * rate.count()).sum();

        var readByMonth = new ArrayList<>(Collections.nCopies(12, 0L));
        books.groupFinishedByMonth(userId, ReadingStatus.READ, LocalDate.of(year, 1, 1), LocalDate.of(year + 1, 1, 1))
            .forEach(group -> readByMonth.set(group.getGroupKey() - 1, group.getTotal()));

        return new MetricsResponseDTO(
            year,
            total,
            byStatus,
            rated == 0 ? null : (double) rateSum / rated,
            rates,
            books.groupFinishedByYear(userId, ReadingStatus.READ).stream()
                .map(group -> new MetricsResponseDTO.YearCount(group.getGroupKey(), group.getTotal()))
                .toList(),
            readByMonth,
            readByMonth.stream().mapToLong(Long::longValue).sum(),
            goals.findByUserIdAndGoalYear(userId, year).map(ReadingGoal::getTarget).orElse(null),
            books.countByOwnerIdAndStatusAndFinishedAtIsNull(userId, ReadingStatus.READ),
            books.topAuthors(userId, ReadingStatus.READ, PageRequest.of(0, TOP_AUTHORS)).stream()
                .map(group -> new MetricsResponseDTO.AuthorCount(group.getGroupKey(), group.getTotal()))
                .toList());
    }

    public void setGoal(UUID userId, int year, int target) {
        goals.upsert(userId, year, target);
    }

    public void deleteGoal(UUID userId, int year) {
        goals.deleteByUserIdAndGoalYear(userId, year);
    }

}
