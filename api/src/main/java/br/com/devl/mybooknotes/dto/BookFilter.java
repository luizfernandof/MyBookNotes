package br.com.devl.mybooknotes.dto;

import br.com.devl.mybooknotes.enums.ReadingStatus;

public record BookFilter(String q, ReadingStatus status, Integer minRate) {
}
