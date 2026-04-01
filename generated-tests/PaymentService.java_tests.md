# Tests for PaymentService.java

I'll analyze this PaymentService code and provide comprehensive testing artifacts.

## BDD SCENARIOS (GHERKIN)

```gherkin
Feature: Payment Processing Service
  As a customer
  I want to process payments with optional coupons
  So that I can complete my purchases with applicable discounts

  @smoke @regression
  Scenario: Process payment without coupon
    Given I have a payment amount of 100.0
    When I process the payment without a coupon
    Then the final amount should be 100.0

  @smoke @regression
  Scenario: Process payment with valid SAVE10 coupon
    Given I have a payment amount of 100.0
    And I have a valid coupon "SAVE10"
    When I process the payment with the coupon
    Then the final amount should be 90.0
    And I should receive a 10% discount

  @regression
  Scenario: Process payment with invalid coupon
    Given I have a payment amount of 100.0
    And I have an invalid coupon "INVALID"
    When I process the payment with the coupon
    Then the final amount should be 100.0
    And no discount should be applied

  @edge @regression
  Scenario: Process payment with zero amount
    Given I have a payment amount of 0.0
    When I attempt to process the payment
    Then an IllegalArgumentException should be thrown
    And the error message should contain "Invalid amount"

  @edge @regression
  Scenario: Process payment with negative amount
    Given I have a payment amount of -50.0
    When I attempt to process the payment
    Then an IllegalArgumentException should be thrown
    And the error message should contain "Invalid amount"

  @regression
  Scenario: Process payment with null coupon
    Given I have a payment amount of 100.0
    And I have a null coupon
    When I process the payment with the coupon
    Then the final amount should be 100.0
```

## TDD TEST SCRIPT

```java
package com.example.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PaymentService Tests")
class PaymentServiceTest {

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService();
    }

    @Nested
    @DisplayName("Valid Payment Processing")
    class ValidPaymentProcessing {

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
        @Tag("regression")
        @DisplayName("Should calculate correct discount for various amounts with SAVE10 coupon")
        @CsvSource({
            "100.0, 90.0",
            "50.0, 45.0",
            "200.0, 180.0",
            "1.0, 0.9",
            "999.99, 899.991"
        })
        void shouldCalculateCorrectDiscountForVariousAmounts(double inputAmount, double expectedAmount) {
            // When
            double result = paymentService.processPayment(inputAmount, "SAVE10");
            
            // Then
            assertEquals(expectedAmount, result, 0.001);
        }

        @Test
        @Tag("regression")
        @DisplayName("Should ignore invalid coupon codes")
        void shouldIgnoreInvalidCouponCodes() {
            // Given
            double amount = 100.0;
            String invalidCoupon = "INVALID";
            
            // When
            double result = paymentService.processPayment(amount, invalidCoupon);
            
            // Then
            assertEquals(100.0, result, 0.01);
        }

        @ParameterizedTest
        @Tag("regression")
        @DisplayName("Should ignore various invalid coupon codes")
        @ValueSource(strings = {"SAVE20", "DISCOUNT", "", "save10", "Save10"})
        void shouldIgnoreVariousInvalidCouponCodes(String invalidCoupon) {
            // Given
            double amount = 100.0;
            
            // When
            double result = paymentService.processPayment(amount, invalidCoupon);
            
            // Then
            assertEquals(100.0, result, 0.01);
        }
    }

    @Nested
    @DisplayName("Invalid Payment Processing")
    class InvalidPaymentProcessing {

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
            double amount = -50.0;
            
            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> paymentService.processPayment(amount, null)
            );
            
            assertEquals("Invalid amount", exception.getMessage());
        }

        @ParameterizedTest
        @Tag("edge")
        @Tag("regression")
        @DisplayName("Should throw exception for various invalid amounts")
        @ValueSource(doubles = {-1.0, -100.0, -0.01, 0.0})
        void shouldThrowExceptionForVariousInvalidAmounts(double invalidAmount) {
            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> paymentService.processPayment(invalidAmount, null)
            );
            
            assertEquals("Invalid amount", exception.getMessage());
        }

        @Test
        @Tag("edge")
        @Tag("regression")
        @DisplayName("Should throw exception for negative amount even with valid coupon")
        void shouldThrowExceptionForNegativeAmountWithValidCoupon() {
            // Given
            double amount = -50.0;
            String coupon = "SAVE10";
            
            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> paymentService.processPayment(amount, coupon)
            );
            
            assertEquals("Invalid amount", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Boundary Value Testing")
    class BoundaryValueTesting {

        @Test
        @Tag("regression")
        @DisplayName("Should process minimum valid amount")
        void shouldProcessMinimumValidAmount() {
            // Given
            double amount = 0.01;
            
            // When
            double result = paymentService.