package org.jakartaee5g23.sports_field_booking_client.configs;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.NonNull;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import java.util.List;
import java.util.Locale;

@Configuration
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LocalResolverConfiguration extends AcceptHeaderLocaleResolver implements WebMvcConfigurer {

    List<Locale> LOCALES = List.of(
            Locale.of("en"),
            Locale.of("vi")
    );

    @Override
    public @NonNull Locale resolveLocale(@NonNull HttpServletRequest request) {
        return StringUtils.hasLength(request.getHeader("Content-Language"))
                ? Locale.lookup(Locale.LanguageRange.parse(request.getHeader("Content-Language")), LOCALES)
                : Locale.getDefault();
    }

    @Bean
    public MessageSource messageSource(
            @Value("${spring.messages.basename}") String basename,
            @Value("${spring.messages.encoding}") String encoding,
            @Value("${spring.messages.default-locale}") String defaultLocale,
            @Value("${spring.messages.cache-duration}") int cacheSeconds
    ) {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename(basename);
        messageSource.setDefaultEncoding(encoding);
        messageSource.setDefaultLocale(Locale.of(defaultLocale));
        messageSource.setCacheSeconds(cacheSeconds);
        return messageSource;
    }

    @Bean
    public LocaleResolver localeResolver(){
        SessionLocaleResolver slr = new SessionLocaleResolver();
        slr.setDefaultLocale(Locale.ENGLISH); // Ngôn ngữ mặc định
        return slr;
    }

}
