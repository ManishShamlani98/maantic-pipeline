# Tests for PaymentService.java

# QA Analysis for PaymentService

## BDD SCENARIOS (GHERKIN)

```gherkin
Feature: Payment Processing
  As a customer
  I want to process payments with optional coupons
  So that I can complete my purchase with potential discounts

  @smoke @regression
  Scenario: Process payment without coupon
    Given I have a payment amount of 100.0
    When I process the payment without a coupon
    Then the final amount should be 100.0

  @smoke @regression
  Scenario: Process payment with valid SAVE10 coupon
    Given I have a payment amount of 100.0
    When I process the payment with coupon "SAVE10"
    Then the final amount should be 90.0

  @regression
  Scenario: Process payment with invalid coupon
    Given I have a payment amount of 50.0
    When I process the payment with coupon "INVALID"
    Then the final amount should be 50.0

  @edge @regression
  Scenario: Process payment with zero amount
    Given I have a payment amount of 0.0
    When I process the payment without a coupon
    Then an IllegalArgumentException should be thrown with message "Invalid amount"

  @edge @regression
  Scenario: Process payment with negative amount
    Given I have a payment amount of -10.0
    When I process the payment without a coupon
    Then an IllegalArgumentException should be thrown with message "Invalid amount"

  @regression
  Scenario: Process payment with null coupon
    Given I have a payment amount of 75.0
    When I process the payment with a null coupon
    Then the final amount should be 75.0
```

## TDD TEST SCRIPT

```java
package com.payment.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Payment Service Tests")
class PaymentServiceTest {

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService();
    }

    @Test
    @Tag("smoke")
    @Tag("regression")
    @DisplayName("Should process payment without coupon successfully")
    void shouldProcessPaymentWithoutCoupon() {
        // Given
        double amount = 100.0;
        
        // When
        double result = paymentService.processPayment(amount, null);
        
        // Then
        assertEquals(100.0, result, 0.01);
    }

    @Test
    @Tag("smoke")
    @Tag("regression")
    @DisplayName("Should apply SAVE10 coupon discount correctly")
    void shouldApplySave10CouponDiscount() {
        // Given
        double amount = 100.0;
        String coupon = "SAVE10";
        
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(90.0, result, 0.01);
    }

    @ParameterizedTest
    @CsvSource({
        "50.0, SAVE10, 45.0",
        "200.0, SAVE10, 180.0",
        "1.0, SAVE10, 0.9"
    })
    @Tag("regression")
    @DisplayName("Should apply SAVE10 coupon to various amounts")
    void shouldApplySave10CouponToVariousAmounts(double amount, String coupon, double expected) {
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(expected, result, 0.01);
    }

    @ParameterizedTest
    @ValueSource(strings = {"INVALID", "SAVE20", "FREE", ""})
    @Tag("regression")
    @DisplayName("Should not apply discount for invalid coupons")
    void shouldNotApplyDiscountForInvalidCoupons(String coupon) {
        // Given
        double amount = 100.0;
        
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(100.0, result, 0.01);
    }

    @Test
    @Tag("edge")
    @Tag("regression")
    @DisplayName("Should throw exception for zero amount")
    void shouldThrowExceptionForZeroAmount() {
        // Given
        double amount = 0.0;
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(amount, null)
        );
        
        assertEquals("Invalid amount", exception.getMessage());
    }

    @Test
    @Tag("edge")
    @Tag("regression")
    @DisplayName("Should throw exception for negative amount")
    void shouldThrowExceptionForNegativeAmount() {
        // Given
        double amount = -10.0;
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(amount, null)
        );
        
        assertEquals("Invalid amount", exception.getMessage());
    }

    @ParameterizedTest
    @ValueSource(doubles = {-1.0, -0.01, -100.0, 0.0})
    @Tag("edge")
    @Tag("regression")
    @DisplayName("Should throw exception for invalid amounts")
    void shouldThrowExceptionForInvalidAmounts(double amount) {
        // When & Then
        assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(amount, "SAVE10")
        );
    }

    @Test
    @Tag("regression")
    @DisplayName("Should handle null coupon same as no coupon")
    void shouldHandleNullCouponSameAsNoCoupon() {
        // Given
        double amount = 75.0;
        
        // When
        double resultWithNull = paymentService.processPayment(amount, null);
        double resultWithoutCoupon = paymentService.processPayment(amount, "");
        
        // Then
        assertEquals(75.0, resultWithNull, 0.01);
        assertEquals(resultWithNull, resultWithoutCoupon, 0.01);
    }

    @Test
    @Tag("regression")
    @DisplayName("Should be case sensitive for coupon codes")
    void shouldBeCaseSensitiveForCouponCodes() {
        // Given
        double amount = 100.0;
        
        // When
        double resultLowerCase = paymentService.processPayment(amount, "save10");
        double resultMixedCase = paymentService.processPayment(amount, "Save10");
        double resultCorrectCase = paymentService.processPayment(amount, "SAVE10");
        
        // Then
        assertEquals(100.0, resultLowerCase, 0.01);
        assertEquals(100.0, resultMixedCase, 0.01);
        assertEquals(90.0, resultCorrectCase, 0.01);
    }

    @Test
    @Tag("regression")
    @DisplayName("Should handle decimal amounts correctly")
    void shouldHandleDecimalAmountsCorrectly() {
        // Given
        double amount = 99.99;
        String coupon = "SAVE10";
        
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(89.991, result, 0.001);
    }
}
```

## GITHUB ACTIONS WORKFLOW

```yaml
name: Payment Service CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test