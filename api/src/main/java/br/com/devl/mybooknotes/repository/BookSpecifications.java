package br.com.devl.mybooknotes.repository;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import br.com.devl.mybooknotes.dto.BookFilter;
import br.com.devl.mybooknotes.model.Book;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

public final class BookSpecifications {

    private static final char LIKE_ESCAPE = '\\';

    private BookSpecifications() {}

    // O filtro de dono é sempre aplicado; os demais só quando informados
    public static Specification<Book> ownedByAndMatching(UUID ownerId, BookFilter filter) {
        return (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();
            predicates.add(cb.equal(root.get("owner").get("id"), ownerId));

            if (filter.q() != null && !filter.q().isBlank()) {
                var pattern = normalize(cb, cb.literal("%" + escapeLike(filter.q().strip()) + "%"));
                predicates.add(cb.or(
                    cb.like(normalize(cb, root.get("title")), pattern, LIKE_ESCAPE),
                    cb.like(normalize(cb, root.get("author")), pattern, LIKE_ESCAPE)));
            }
            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (filter.minRate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.<Integer>get("rate"), filter.minRate()));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    // Ignora maiúsculas e acentos dos dois lados da comparação
    private static Expression<String> normalize(CriteriaBuilder cb, Expression<String> value) {
        return cb.lower(cb.function("unaccent", String.class, value));
    }

    // Sem isto, buscar "%" ou "_" encontraria qualquer livro
    private static String escapeLike(String text) {
        return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

}
