package br.com.devl.mybooknotes.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenCleanupJob.class);

    private final RefreshTokenService refreshTokenService;

    public RefreshTokenCleanupJob(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }

    @Scheduled(cron = "${jwt.refresh-token-cleanup-cron:0 0 3 * * *}")
    public void deleteExpiredTokens() {
        int deleted = refreshTokenService.deleteExpired();
        log.info("Limpeza de refresh tokens: {} token(s) expirado(s) removido(s)", deleted);
    }

}
