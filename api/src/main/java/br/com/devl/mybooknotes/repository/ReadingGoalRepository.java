package br.com.devl.mybooknotes.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import br.com.devl.mybooknotes.model.ReadingGoal;

public interface ReadingGoalRepository extends JpaRepository<ReadingGoal, UUID> {

    Optional<ReadingGoal> findByUserIdAndGoalYear(UUID userId, int goalYear);

    // Upsert atômico: dois salvamentos simultâneos não violam a restrição de unicidade
    @Transactional
    @Modifying
    @Query(value = """
        INSERT INTO reading_goals (id, user_id, goal_year, target)
        VALUES (gen_random_uuid(), :userId, :goalYear, :target)
        ON CONFLICT (user_id, goal_year) DO UPDATE SET target = EXCLUDED.target
        """, nativeQuery = true)
    void upsert(@Param("userId") UUID userId, @Param("goalYear") int goalYear, @Param("target") int target);

    @Transactional
    void deleteByUserIdAndGoalYear(UUID userId, int goalYear);

}
