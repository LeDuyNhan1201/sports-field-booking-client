package org.jakartaee5g23.sports_field_booking_client.configs;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;

import java.io.IOException;

@Configuration
@RequiredArgsConstructor
public class LogoutHandlerConfiguration implements LogoutHandler {

    private static final String ACCESS_TOKEN_COOKIE = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {
        // Xóa cookie accessToken
        deleteCookie(response, ACCESS_TOKEN_COOKIE, "/");

        // Xóa cookie refreshToken
        deleteCookie(response, REFRESH_TOKEN_COOKIE, "/");

        // Xóa SecurityContext (nếu cần thiết)
        SecurityContextHolder.clearContext();

        // Chuyển hướng người dùng đến trang chủ
        try {
            response.sendRedirect("/sports-field-booking");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void deleteCookie(HttpServletResponse response, String name, String path) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath(path);
        cookie.setMaxAge(0); // Đặt tuổi thọ cookie về 0 để xóa
        cookie.setDomain("localhost"); // Thiết lập domain nếu cần
        response.addCookie(cookie);
    }

}
