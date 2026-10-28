package br.com.devl.mybooknotes.exception;

public class EmailAlreadyInUseException extends RuntimeException {

    public EmailAlreadyInUseException() {
        super("E-mail já cadastrado");
    }

}
