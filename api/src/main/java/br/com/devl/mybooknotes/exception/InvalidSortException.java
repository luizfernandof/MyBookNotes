package br.com.devl.mybooknotes.exception;

public class InvalidSortException extends RuntimeException {

    public InvalidSortException(String property) {
        super("Não é possível ordenar por: " + property);
    }

}
