package org.jakartaee5g23.sports_field_booking_client;

import com.nimbusds.jose.JWSAlgorithm;

import static com.nimbusds.jose.JWSAlgorithm.HS512;

public class Constants {

    public static final JWSAlgorithm ACCESS_TOKEN_SIGNATURE_ALGORITHM = HS512;

}
