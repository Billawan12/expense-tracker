package com.expense.tracker.service;

import com.expense.tracker.model.Expense;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserService userService;

    public Expense saveExpense(Expense expense, Long userId) {
        User user = userService.findById(userId);
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesByUser(Long userId) {
        User user = userService.findById(userId);
        return expenseRepository.findByUserOrderByExpenseDateDesc(user);
    }

    public Expense getExpenseById(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        // Check if expense belongs to the user
        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to view this expense");
        }

        return expense;
    }

    public Expense updateExpense(Expense expense, Long userId) {
        // Check if expense exists and belongs to user
        Expense existingExpense = getExpenseById(expense.getId(), userId);

        // Update fields
        existingExpense.setAmount(expense.getAmount());
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setDescription(expense.getDescription());
        existingExpense.setExpenseDate(expense.getExpenseDate());

        return expenseRepository.save(existingExpense);
    }

    public void deleteExpense(Long id, Long userId) {
        Expense expense = getExpenseById(id, userId);
        expenseRepository.delete(expense);
    }

    public List<Expense> getExpensesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        // You can add custom queries later
        return getExpensesByUser(userId);
    }

    public List<Expense> getExpensesByCategory(Long userId, String category) {
        // You can add custom queries later
        return getExpensesByUser(userId);
    }
}