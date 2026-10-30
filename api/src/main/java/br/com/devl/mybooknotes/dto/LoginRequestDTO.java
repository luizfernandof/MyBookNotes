package br.com.devl.mybooknotes.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank @NoNullCharacter String email,
        @NotBlank String password)
{
}
