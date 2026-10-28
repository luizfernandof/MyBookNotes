package br.com.devl.mybooknotes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// O BCrypt ignora tudo depois de 72 bytes, por isso o limite máximo
public record RegisterRequestDTO(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String password)
{
}
