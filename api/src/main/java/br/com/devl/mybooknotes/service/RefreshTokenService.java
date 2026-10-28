package br.com.devl.mybooknotes.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.devl.mybooknotes.config.JwtProperties;
import br.com.devl.mybooknotes.exception.UnauthorizedException;
import br.com.devl.mybooknotes.model.RefreshToken;
import br.com.devl.mybooknotes.model.User;
import br.com.devl.mybooknotes.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {

    public record RotatedToken(UUID userId, String refreshToken) {}

    private static final int TOKEN_BYTES = 32;

    private final RefreshTokenRepository repository;
    private final JwtProperties properties;
    private final SecureRandom random = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository, JwtProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    // Um login inicia uma nova família de tokens
    @Transactional
    public String issue(User user) {
        return save(user, UUID.randomUUID());
    }

    // noRollbackFor: a revogação da família em caso de reuso precisa ser gravada mesmo com a exceção
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public RotatedToken rotate(String rawToken) {
        var token = find(rawToken);
        var now = Instant.now();

        if (token.isRevoked()) {
            // Token já usado sendo apresentado de novo: provável roubo.
            // Revoga a família inteira, derrubando também quem estiver com o token atual.
            repository.revokeFamily(token.getFamilyId(), now);
            throw invalidToken();
        }
        if (token.isExpired(now)) {
            throw invalidToken();
        }

        token.setRevokedAt(now);
        var newToken = save(token.getUser(), token.getFamilyId());
        return new RotatedToken(token.getUser().getId(), newToken);
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return;
        repository.findByTokenHash(hash(rawToken))
            .ifPresent(token -> repository.revokeFamily(token.getFamilyId(), Instant.now()));
    }

    // Só apaga tokens expirados. Revogados ainda válidos ficam: são eles que permitem
    // detectar o reuso de um token roubado e revogar a família.
    @Transactional
    public int deleteExpired() {
        return repository.deleteExpired(Instant.now());
    }

    private RefreshToken find(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) throw invalidToken();
        return repository.findByTokenHash(hash(rawToken)).orElseThrow(this::invalidToken);
    }

    private String save(User user, UUID familyId) {
        var bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        var rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        var expiresAt = Instant.now().plus(properties.refreshTokenTtl());
        repository.save(new RefreshToken(user, hash(rawToken), familyId, expiresAt));
        return rawToken;
    }

    private String hash(String rawToken) {
        try {
            var digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private UnauthorizedException invalidToken() {
        return new UnauthorizedException("Refresh token inválido ou expirado");
    }

}
