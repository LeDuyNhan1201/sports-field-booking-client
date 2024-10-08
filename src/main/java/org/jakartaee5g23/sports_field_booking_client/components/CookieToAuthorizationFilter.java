package org.jakartaee5g23.sports_field_booking_client.components;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class CookieToAuthorizationFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "accessToken"; // Tên cookie chứa access token

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        // Lấy cookie từ yêu cầu
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    String token = cookie.getValue();
                    if (token != null && !token.isEmpty()) {
                        // Gắn token vào header Authorization
                        String bearerToken = "Bearer " + token;
                        // Nếu header Authorization chưa tồn tại, thêm mới
                        if (request.getHeader(HttpHeaders.AUTHORIZATION) == null) {
                            request = new HttpServletRequestWrapper(request) {
                                @Override
                                public String getHeader(String name) {
                                    if (HttpHeaders.AUTHORIZATION.equalsIgnoreCase(name)) {
                                        return bearerToken;
                                    }
                                    return super.getHeader(name);
                                }
                            };
                        }

                    } else filterChain.doFilter(request, response);
                    break;
                }
            }
        }

        // Tiếp tục chuỗi bộ lọc
        filterChain.doFilter(request, response);
    }
}