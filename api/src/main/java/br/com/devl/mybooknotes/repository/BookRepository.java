package br.com.devl.mybooknotes.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.devl.mybooknotes.enums.ReadingStatus;
import br.com.devl.mybooknotes.model.Book;

public interface BookRepository extends JpaRepository<Book, UUID>, JpaSpecificationExecutor<Book> {

    interface GroupCount<K> {
        K getGroupKey();
        long getTotal();
    }

    Optional<Book> findByIdAndOwnerId(UUID id, UUID ownerId);

    long countByOwnerIdAndStatusAndFinishedAtIsNull(UUID ownerId, ReadingStatus status);

    @Query("""
        select b.status as groupKey, count(b) as total from Book b
        where b.owner.id = :ownerId group by b.status
        """)
    List<GroupCount<ReadingStatus>> groupByStatus(@Param("ownerId") UUID ownerId);

    @Query("""
        select b.rate as groupKey, count(b) as total from Book b
        where b.owner.id = :ownerId and b.rate is not null group by b.rate order by b.rate
        """)
    List<GroupCount<Integer>> groupByRate(@Param("ownerId") UUID ownerId);

    @Query("""
        select year(b.finishedAt) as groupKey, count(b) as total from Book b
        where b.owner.id = :ownerId and b.status = :status and b.finishedAt is not null
        group by year(b.finishedAt) order by year(b.finishedAt) desc
        """)
    List<GroupCount<Integer>> groupFinishedByYear(@Param("ownerId") UUID ownerId, @Param("status") ReadingStatus status);

    @Query("""
        select month(b.finishedAt) as groupKey, count(b) as total from Book b
        where b.owner.id = :ownerId and b.status = :status and b.finishedAt >= :start and b.finishedAt < :end
        group by month(b.finishedAt)
        """)
    List<GroupCount<Integer>> groupFinishedByMonth(@Param("ownerId") UUID ownerId, @Param("status") ReadingStatus status,
        @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("""
        select b.author as groupKey, count(b) as total from Book b
        where b.owner.id = :ownerId and b.status = :status
        group by b.author order by count(b) desc, b.author
        """)
    List<GroupCount<String>> topAuthors(@Param("ownerId") UUID ownerId, @Param("status") ReadingStatus status, Pageable pageable);

}
