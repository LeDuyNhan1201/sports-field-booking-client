package org.jakartaee5g23.sports_field_booking_client.components;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Component;

import java.util.Locale;

@RequiredArgsConstructor
@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Translator {

    static ResourceBundleMessageSource messageSource;

    @Autowired
    public Translator(ResourceBundleMessageSource messageSource) {
        Translator.messageSource = messageSource;
    }

    public static String getLocalizedMessage(String messageKey, Object... args) {
        Locale locale = LocaleContextHolder.getLocale();
        try {
            return messageSource.getMessage(messageKey, args, locale);

        } catch (NoSuchMessageException exception) {
            return exception.getMessage();
        }
    }

}
