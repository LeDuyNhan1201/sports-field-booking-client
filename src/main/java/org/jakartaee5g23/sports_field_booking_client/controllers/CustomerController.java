package org.jakartaee5g23.sports_field_booking_client.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import static org.jakartaee5g23.sports_field_booking_client.components.Translator.getLocalizedMessage;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerController {

    @GetMapping
    public String homePage(Model model){
        model.addAttribute("title", getLocalizedMessage("customer.home.title"));
        model.addAttribute("content", "home");
        return "pages/customer";
    }

    @GetMapping("/sports-field")
    public String sportFieldPage(Model model){
        model.addAttribute("title", getLocalizedMessage("customer.sports_field.title"));
        model.addAttribute("content", "sportsField");
        return "pages/customer";
    }

    @GetMapping("/booking")
    public String bookingPage(Model model){
        model.addAttribute("title", getLocalizedMessage("customer.booking.title"));
        model.addAttribute("content", "booking");
        return "pages/customer";
    }

    @GetMapping("/account")
    public String accountPage(Model model){
        model.addAttribute("title", getLocalizedMessage("customer.account.title"));
        model.addAttribute("content", "account");
        return "pages/customer";
    }

    @GetMapping("/userInfo")
    public String userInfoPage(Model model){
        model.addAttribute("title", getLocalizedMessage("userInfo.profile_menu.title "));
        model.addAttribute("content", "userInfo");
        return "pages/customer";
    }

    @GetMapping("/field-detail/{id}")
    public String fieldDetailPage(@PathVariable String id, Model model){
        model.addAttribute("content", "fieldDetail");
        model.addAttribute("id", id);
        return "pages/customer";
    }
    @GetMapping("/field-review/{id}")
    public String fieldReviewPage(@PathVariable String id, Model model){
        model.addAttribute("content", "fieldReview");
        model.addAttribute("id", id);
        return "pages/customer";
    }

}
