package org.jakartaee5g23.sports_field_booking_client.configs;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.jakartaee5g23.sports_field_booking_client.components.CookieToAuthorizationFilter;
import org.jakartaee5g23.sports_field_booking_client.components.CustomJwtDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.stream.Stream;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SecurityConfiguration {

        CustomJwtDecoder customJwtDecoder;

        CookieToAuthorizationFilter cookieToAuthorizationFilter;

        LogoutHandlerConfiguration logoutHandlerConfiguration;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {

        String[] PUBLIC_ENDPOINTS = Stream.of(
                // Auth Controller
                "/auth",
                "/auth/**",
                "/sign-out",

                // Settings Controller
                "/settings/**",

                // Customer Controller
                "/",
                "/sports-field",
                "/booking",
                "/account",
                "/field-detail/**",
                "/field-review/**",

                // Frontend Resources
                "/css/**",
                "/js/**",
                "/image/**",
                "/image/login/**"
                ).toList().toArray(new String[0]);

                httpSecurity.authorizeHttpRequests(request -> {
                                request.requestMatchers(PUBLIC_ENDPOINTS)
                                        .permitAll()
                                        .anyRequest()
                                        .authenticated();
                        })
                        .addFilterBefore(cookieToAuthorizationFilter, BearerTokenAuthenticationFilter.class)
                        .oauth2ResourceServer(oauth2 -> oauth2
                                .jwt(jwtConfigurer -> jwtConfigurer
                                        .decoder(customJwtDecoder)
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        ))
                        .formLogin(form -> form
                                .loginPage("/auth")
                                .defaultSuccessUrl("/", true)
                                .permitAll()
                        )
                        .logout(logoutHandler -> {
                                logoutHandler.logoutUrl("/sign-out")
                                        .addLogoutHandler(logoutHandlerConfiguration);
                        })
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(withDefaults())
                        .sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

                return httpSecurity.build();
        }

        @Bean
        public JwtAuthenticationConverter jwtAuthenticationConverter() {
                JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
                jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

                JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
                jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

                return jwtAuthenticationConverter;
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration corsConfiguration = new CorsConfiguration();

                corsConfiguration.addAllowedOrigin("*");
                corsConfiguration.addAllowedMethod("*");
                corsConfiguration.addAllowedHeader("*");

                UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
                urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

                return urlBasedCorsConfigurationSource;
        }

}