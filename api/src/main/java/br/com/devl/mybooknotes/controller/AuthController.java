package br.com.devl.mybooknotes.controller;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.devl.mybooknotes.config.JwtProperties;
import br.com.devl.mybooknotes.dto.AuthResponseDTO;
import br.com.devl.mybooknotes.dto.LoginRequestDTO;
import br.com.devl.mybooknotes.dto.RegisterRequestDTO;
import br.com.devl.mybooknotes.dto.UserResponseDTO;
import br.com.devl.mybooknotes.service.AuthService;
import br.com.devl.mybooknotes.service.AuthService.AuthTokens;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String REFRESH_COOKIE = "refresh_token";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    private final AuthService service;
    private final JwtProperties properties;

    public AuthController(AuthService service, JwtProperties properties) {
        this.service = service;
        this.properties = properties;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        var user = service.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return withTokens(service.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        return withTokens(service.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        service.logout(refreshToken);
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, refreshCookie("", Duration.ZERO).toString())
            .build();
    }

    private ResponseEntity<AuthResponseDTO> withTokens(AuthTokens tokens) {
        var cookie = refreshCookie(tokens.refreshToken(), properties.refreshTokenTtl());
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(AuthResponseDTO.bearer(tokens.accessToken(), tokens.expiresIn()));
    }

    private ResponseCookie refreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path(REFRESH_COOKIE_PATH)
            .maxAge(maxAge)
            .build();
    }

}
