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
@RequestMapping("/booking-history")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingHistoryController {

    @GetMapping
    public String bookingHistoryPage(Model model) {
        model.addAttribute("title", getLocalizedMessage("booking.history.title"));
        model.addAttribute("content", "bookingHistory");
        return "pages/booking/booking-history";
    }
}