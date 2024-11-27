package org.jakartaee5g23.sports_field_booking_client.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('FIELD_OWNER')")
    public String homePage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.home.title"));
        model.addAttribute("content", "home");
        return "pages/dashboard";
    }

    @GetMapping("/sport-field")
    @PreAuthorize("hasRole('FIELD_OWNER') or hasRole('ADMIN')")
    public String sportFieldPage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.sports_field.title"));
        model.addAttribute("content", "sportsField");
        return "pages/dashboard";
    }

    @GetMapping("/user-profile")
    public String userProfilePage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.user_profile.title"));
        model.addAttribute("content", "userProfile");
        return "pages/dashboard";
    }

    @GetMapping("/file-storage")
    public String fileStoragePage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.file_storage.title"));
        model.addAttribute("content", "fileStorage");
        return "pages/dashboard";
    }

    @GetMapping("/promotion")
    @PreAuthorize("hasRole('FIELD_OWNER') or hasRole('ADMIN')")
    public String promotionPage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.promotion.title"));
        model.addAttribute("content", "promotion");
        return "pages/dashboard";
    }

    @GetMapping("/order")
    @PreAuthorize("hasRole('FIELD_OWNER')")
    public String orderPage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.order.title"));
        model.addAttribute("content", "order");
        return "pages/dashboard";
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('ADMIN')")
    public String userPage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.user_heading.title"));
        model.addAttribute("content", "user");
        return "pages/dashboard";
    }

    @GetMapping("/category")
    @PreAuthorize("hasRole('ADMIN')")
    public String categoryPage(Model model) {
        model.addAttribute("title", getLocalizedMessage("dashboard.category.title"));
        model.addAttribute("content", "category");
        return "pages/dashboard";
    }
}
