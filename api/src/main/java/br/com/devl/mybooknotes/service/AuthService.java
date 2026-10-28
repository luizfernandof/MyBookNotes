package br.com.devl.mybooknotes.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.devl.mybooknotes.dto.LoginRequestDTO;
import br.com.devl.mybooknotes.dto.RegisterRequestDTO;
import br.com.devl.mybooknotes.dto.UserResponseDTO;
import br.com.devl.mybooknotes.exception.EmailAlreadyInUseException;
import br.com.devl.mybooknotes.exception.UnauthorizedException;
import br.com.devl.mybooknotes.model.User;
import br.com.devl.mybooknotes.repository.UserRepository;

@Service
public class AuthService {

    public record AuthTokens(String accessToken, long expiresIn, String refreshToken) {}

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;

    // Usado quando o e-mail não existe, para o login levar o mesmo tempo
    // e não revelar quais e-mails estão cadastrados
    private final String dummyPasswordHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            TokenService tokenService, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.refreshTokenService = refreshTokenService;
        this.dummyPasswordHash = passwordEncoder.encode("dummy-password");
    }

    @Transactional
    public UserResponseDTO register(RegisterRequestDTO request) {
        var email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyInUseException();
        }
        var user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    @Transactional
    public AuthTokens login(LoginRequestDTO request) {
        var user = userRepository.findByEmail(normalize(request.email())).orElse(null);
        var hash = user != null ? user.getPasswordHash() : dummyPasswordHash;

        if (!passwordEncoder.matches(request.password(), hash) || user == null) {
            throw new UnauthorizedException("E-mail ou senha inválidos");
        }

        var accessToken = tokenService.generateAccessToken(user.getId());
        var refreshToken = refreshTokenService.issue(user);
        return new AuthTokens(accessToken, tokenService.accessTokenTtlSeconds(), refreshToken);
    }

    public AuthTokens refresh(String rawRefreshToken) {
        var rotated = refreshTokenService.rotate(rawRefreshToken);
        var accessToken = tokenService.generateAccessToken(rotated.userId());
        return new AuthTokens(accessToken, tokenService.accessTokenTtlSeconds(), rotated.refreshToken());
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

}
