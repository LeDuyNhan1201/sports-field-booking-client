package org.jakartaee5g23.sports_field_booking_client.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.jakartaee5g23.sports_field_booking_client.enums.VerifyType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import static org.jakartaee5g23.sports_field_booking_client.components.Translator.getLocalizedMessage;

@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    @GetMapping
    public String signInPage(Model model){
        model.addAttribute("title", getLocalizedMessage("sign_in.title"));
        model.addAttribute("content", "home");
        return "pages/authentication/sign-in";
    }

    @GetMapping("sign-up")
    public String signUpPage(Model model){
        model.addAttribute("title", getLocalizedMessage("sign_up.title"));
        return "pages/authentication/sign-up";
    }

    @GetMapping("/verify")
    public String verifyPage(@RequestParam VerifyType verifyType, Model model){
        model.addAttribute("title",
                getLocalizedMessage("verify.title", getLocalizedMessage(verifyType.getMessage())));
        return "pages/authentication/verify";
    }

    @GetMapping("/forgot")
    public String forgotPage(Model model){
        model.addAttribute("title", getLocalizedMessage("forgot.title"));
        return "pages/authentication/forgot";
    }

    @GetMapping("/reset")
    public String resetPage(Model model){
        model.addAttribute("title", getLocalizedMessage("reset.title"));
        return "pages/authentication/reset";
    }

}
