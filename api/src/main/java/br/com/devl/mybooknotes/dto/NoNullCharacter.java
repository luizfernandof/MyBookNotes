package br.com.devl.mybooknotes.dto;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.Pattern;

// O PostgreSQL não aceita o caractere NUL (\u0000) em textos: sem esta validação, a consulta falha com erro 500
@Pattern(regexp = "[^\\x00]*")
@ReportAsSingleViolation
@Constraint(validatedBy = {})
@Target({ ElementType.FIELD, ElementType.RECORD_COMPONENT, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface NoNullCharacter {

    String message() default "must not contain null characters";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
