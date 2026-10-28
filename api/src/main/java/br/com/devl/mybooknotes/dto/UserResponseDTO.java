package br.com.devl.mybooknotes.dto;

import java.util.UUID;

import br.com.devl.mybooknotes.model.User;

public record UserResponseDTO(UUID id, String email) {

    public static UserResponseDTO fromEntity(User user) {
        return new UserResponseDTO(user.getId(), user.getEmail());
    }
}
