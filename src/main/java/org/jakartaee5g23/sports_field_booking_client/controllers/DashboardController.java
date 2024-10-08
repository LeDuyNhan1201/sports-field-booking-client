package org.jakartaee5g23.sports_field_booking_client.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import static org.jakartaee5g23.sports_field_booking_client.components.Translator.getLocalizedMessage;

@Controller
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {

    @GetMapping
    public String homePage(Model model){
        model.addAttribute("title", getLocalizedMessage("dashboard.home.title"));
        model.addAttribute("content", "home");
        return "pages/dashboard";
    }

    @GetMapping("sports-field")
    public String sportFieldPage(Model model){
        model.addAttribute("title", getLocalizedMessage("dashboard.sports_field.title"));
        model.addAttribute("content", "sportsField");
        return "pages/dashboard";
    }

    @GetMapping("/user-profile")
    public String userProfilePage(Model model){
        model.addAttribute("title", getLocalizedMessage("dashboard.user_profile.title"));
        model.addAttribute("content", "userProfile");
        return "pages/dashboard";
    }

}
