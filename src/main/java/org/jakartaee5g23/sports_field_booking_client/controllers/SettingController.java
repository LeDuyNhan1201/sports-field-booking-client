package org.jakartaee5g23.sports_field_booking_client.controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.LocaleResolver;

import java.util.Locale;

@Controller
@RequestMapping("/settings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SettingController {

    private final LocaleResolver localeResolver;

    @GetMapping("/switch-language")
    public String switchLanguage(HttpServletRequest request,
                                 HttpServletResponse response,
                                 @RequestParam(name = "lang") String lang,
                                 @RequestParam(name = "returnUrl", required = false) String returnUrl) {
        Locale locale = Locale.of(lang);
        localeResolver.setLocale(request, response, locale);
        Cookie cookie = new Cookie("accept-language", lang);
        cookie.setPath("/");
        cookie.setDomain("localhost"); // Thiết lập domain nếu cần
        response.addCookie(cookie);

        if (returnUrl != null && !returnUrl.isEmpty()) {
            return "redirect:" + returnUrl;
        }
        return "redirect:/";
    }

}
