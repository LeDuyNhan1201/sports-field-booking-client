package org.jakartaee5g23.sports_field_booking_client.components;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.LocaleResolver;

import java.util.Locale;

@Component
@AllArgsConstructor
public class CustomInterceptor implements HandlerInterceptor {

    private final LocaleResolver localeResolver;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Logic áp dụng cho tất cả các request
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accept-language".equals(cookie.getName())) {
                    Locale locale = Locale.of(cookie.getValue());
                    localeResolver.setLocale(request, response, locale);
                }
            }
        }
        return true; // Tiếp tục xử lý request
    }
}
