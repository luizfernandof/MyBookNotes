package br.com.devl.mybooknotes.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import br.com.devl.mybooknotes.TestcontainersConfig;
import br.com.devl.mybooknotes.model.RefreshToken;
import br.com.devl.mybooknotes.model.User;
import br.com.devl.mybooknotes.repository.RefreshTokenRepository;
import br.com.devl.mybooknotes.repository.UserRepository;

@SpringBootTest
@Import(TestcontainersConfig.class)
@Transactional
class RefreshTokenCleanupTest {

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    private RefreshToken token(User user, Instant expiresAt, boolean revoked) {
        var token = new RefreshToken(user, UUID.randomUUID().toString().replace("-", ""), UUID.randomUUID(), expiresAt);
        if (revoked) token.setRevokedAt(Instant.now());
        return refreshTokenRepository.save(token);
    }

    @Test
    void deletesOnlyExpiredTokens() {
        var user = new User();
        user.setEmail("cleanup-" + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("hash");
        userRepository.save(user);

        var now = Instant.now();
        var expired = token(user, now.minus(Duration.ofDays(1)), false);
        var expiredAndRevoked = token(user, now.minus(Duration.ofMinutes(1)), true);
        var active = token(user, now.plus(Duration.ofDays(7)), false);
        var revokedButNotExpired = token(user, now.plus(Duration.ofDays(3)), true);

        int deleted = refreshTokenService.deleteExpired();

        assertThat(deleted).isEqualTo(2);
        assertThat(refreshTokenRepository.existsById(expired.getId())).isFalse();
        assertThat(refreshTokenRepository.existsById(expiredAndRevoked.getId())).isFalse();
        assertThat(refreshTokenRepository.existsById(active.getId())).isTrue();
        // Mantido para que a detecção de reuso continue funcionando
        assertThat(refreshTokenRepository.existsById(revokedButNotExpired.getId())).isTrue();
    }

}
