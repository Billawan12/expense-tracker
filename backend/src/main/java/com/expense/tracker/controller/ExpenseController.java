package com.expense.tracker.controller;

import com.expense.tracker.model.Expense;
import com.expense.tracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

/**
 * Controller for handling expense-related web pages using Thymeleaf.
 */
@Controller
@RequestMapping("/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    /**
     * Temporary method to get logged-in user ID.
     * Will be replaced with Spring Security later.
     */
    private Long getLoggedInUserId() {
        return 1L; // Hardcoded for now
    }

    /**
     * Displays the list of all expenses for the logged-in user.
     */
    @GetMapping("/list")
    public String listExpenses(Model model) {
        try {
            Long userId = getLoggedInUserId();
            model.addAttribute("expenses", expenseService.getExpensesByUser(userId));
        } catch (Exception e) {
            // If no user exists, show empty list
            model.addAttribute("expenses", new ArrayList<>());
            System.out.println("No user found. Please create a test user in the database.");
        }
        return "expenses/list";
    }

    /**
     * Displays the form to add a new expense.
     */
    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("expense", new Expense());
        return "expenses/add";
    }

    /**
     * Processes the form submission to add a new expense.
     */
    @PostMapping("/add")
    public String addExpense(@Valid @ModelAttribute("expense") Expense expense,
                             BindingResult result) {
        if (result.hasErrors()) {
            return "expenses/add";
        }
        Long userId = getLoggedInUserId();
        expenseService.saveExpense(expense, userId);
        return "redirect:/expenses/list";
    }

    /**
     * Displays the form to edit an existing expense.
     */
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        Long userId = getLoggedInUserId();
        Expense expense = expenseService.getExpenseById(id, userId);
        model.addAttribute("expense", expense);
        return "expenses/edit";
    }

    /**
     * Processes the form submission to update an existing expense.
     */
    @PostMapping("/edit/{id}")
    public String updateExpense(@PathVariable Long id,
                                @Valid @ModelAttribute("expense") Expense expense,
                                BindingResult result) {
        if (result.hasErrors()) {
            return "expenses/edit";
        }
        Long userId = getLoggedInUserId();
        expense.setId(id);
        expenseService.updateExpense(expense, userId);
        return "redirect:/expenses/list";
    }

    /**
     * Deletes an expense by its ID.
     */
    @GetMapping("/delete/{id}")
    public String deleteExpense(@PathVariable Long id) {
        Long userId = getLoggedInUserId();
        expenseService.deleteExpense(id, userId);
        return "redirect:/expenses/list";
    }

    /**
     * Test method to verify Thymeleaf is working.
     */
    @GetMapping("/test")
    public String testPage() {
        return "expenses/list";
    }
}