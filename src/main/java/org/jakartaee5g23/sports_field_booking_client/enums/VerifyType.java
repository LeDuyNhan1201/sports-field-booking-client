package org.jakartaee5g23.sports_field_booking_client.enums;

import lombok.Getter;

@Getter
public enum VerifyType {

    VERIFY_EMAIL_BY_CODE("verify.type.by_code"),

    VERIFY_EMAIL_BY_TOKEN("verify.type.by_token"),

    ;

    VerifyType(String message) {
        this.message = message;
    }

    private final String message;

}