package br.com.devl.mybooknotes.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReadingGoalRequestDTO(@NotNull @Min(1) @Max(1000) Integer target) {
}
