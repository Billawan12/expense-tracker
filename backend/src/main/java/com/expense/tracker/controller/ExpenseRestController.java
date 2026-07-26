package com.expense.tracker.controller;

import com.expense.tracker.model.Expense;
import com.expense.tracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseRestController {

    @Autowired
    private ExpenseService expenseService;

    // Temporary - will be replaced with Spring Security later
    private Long getLoggedInUserId() {
        return 1L; // Hardcoded for now
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        Long userId = getLoggedInUserId();
        List<Expense> expenses = expenseService.getExpensesByUser(userId);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        Long userId = getLoggedInUserId();
        Expense savedExpense = expenseService.saveExpense(expense, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        Long userId = getLoggedInUserId();
        expenseService.deleteExpense(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test")
    public String test() {
        return "Expense REST Controller is working!";
    }
}