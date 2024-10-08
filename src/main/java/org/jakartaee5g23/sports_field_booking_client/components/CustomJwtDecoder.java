package org.jakartaee5g23.sports_field_booking_client.components;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Objects;

import static org.jakartaee5g23.sports_field_booking_client.Constants.ACCESS_TOKEN_SIGNATURE_ALGORITHM;

@Component
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.accessSignerKey}")
    private String ACCESS_SIGNER_KEY;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(ACCESS_SIGNER_KEY.getBytes(), ACCESS_TOKEN_SIGNATURE_ALGORITHM.getName());
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.from(ACCESS_TOKEN_SIGNATURE_ALGORITHM.getName()))
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }

}