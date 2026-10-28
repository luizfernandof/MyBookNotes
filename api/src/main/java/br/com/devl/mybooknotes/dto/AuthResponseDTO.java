package br.com.devl.mybooknotes.dto;

// O refresh token não aparece aqui: ele vai num cookie HttpOnly, fora do alcance do JavaScript
public record AuthResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn)
{
    public static AuthResponseDTO bearer(String accessToken, long expiresIn) {
        return new AuthResponseDTO(accessToken, "Bearer", expiresIn);
    }
}
