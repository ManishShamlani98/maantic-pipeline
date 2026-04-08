# AI Generated Tests — PaymentService.java

Language: Java
Timestamp: 2026-04-08T05-52-42-983Z
Has Requirement: false

=== HUMAN READABLE TEST CASES ===

TC-001: [ASSUMPTION] Valid payment processing with positive amount and no discount coupon
Category: Smoke
Preconditions: Payment service is available and functioning
Steps:
  1. Submit a payment request with amount $50.00
  2. Do not provide any coupon code
Expected Result: System should process the payment and return the full amount of $50.00
Requirement Ref: Basic payment processing functionality
Status: NEW
---

TC-002: [ASSUMPTION] Valid payment processing with SAVE10 discount coupon applied
Category: Smoke
Preconditions: Payment service is available and SAVE10 coupon is active
Steps:
  1. Submit a payment request with amount $100.00
  2. Apply coupon code "SAVE10"
Expected Result: System should apply 10% discount and return final amount of $90.00
Requirement Ref: Discount coupon functionality
Status: NEW
---

TC-003: [ASSUMPTION] Payment processing rejects zero amount
Category: Edge Case
Preconditions: Payment service is available
Steps:
  1. Submit a payment request with amount $0.00
  2. Do not provide any coupon code
Expected Result: System should reject the payment and display error message "Invalid amount"
Requirement Ref: Payment validation rules
Status: NEW
---

TC-004: [ASSUMPTION] Payment processing rejects negative amount
Category: Edge Case
Preconditions: Payment service is available
Steps:
  1. Submit a payment request with negative amount -$25.00
  2. Do not provide any coupon code
Expected Result: System should reject the payment and display error message "Invalid amount"
Requirement Ref: Payment validation rules
Status: NEW
---

TC-005: [ASSUMPTION] Payment processing with invalid coupon code
Category: Regression
Preconditions: Payment service is available
Steps:
  1. Submit a payment request with amount $75.00
  2. Apply invalid coupon code "INVALID10"
Expected Result: System should process the payment at full price and return $75.00 (coupon ignored)
Requirement Ref: Invalid coupon handling
Status: NEW
---

TC-006: [ASSUMPTION] Payment processing with empty coupon code
Category: Edge Case
Preconditions: Payment service is available
Steps:
  1. Submit a payment request with amount $30.00
  2. Provide empty coupon code ""
Expected Result: System should process the payment at full price and return $30.00
Requirement Ref: Empty coupon handling
Status: NEW
---

TC-007: [ASSUMPTION] Payment processing with case-sensitive coupon validation
Category: Edge Case
Preconditions: Payment service is available
Steps:
  1. Submit a payment request with amount $200.00
  2. Apply coupon code "save10" (lowercase)
Expected Result: System should process the payment at full price $200.00 (case-sensitive coupon not recognized)
Requirement Ref: Coupon code case sensitivity
Status: NEW
---

TC-008: [ASSUMPTION] Payment processing with very small positive amount and discount
Category: Edge Case
Preconditions: Payment service is available and SAVE10 coupon is active
Steps:
  1. Submit a payment request with amount $0.01
  2. Apply coupon code "SAVE10"
Expected Result: System should apply 10% discount and return final amount of $0.009
Requirement Ref: Minimum amount discount calculation
Status: NEW
---

=== BDD GHERKIN SCENARIOS ===

Feature: Payment Processing Service
  As a customer
  I want to process payments with optional discount coupons
  So that I can complete my purchases with applicable savings

  Background:
    Given the payment service is available

  Scenario: Process payment without coupon
    Given I have a valid payment amount of $50.00
    When I submit the payment without any coupon
    Then the final amount should be $50.00

  Scenario: Process payment with valid SAVE10 coupon
    Given I have a valid payment amount of $100.00
    When I submit the payment with coupon "SAVE10"
    Then the final amount should be $90.00

  Scenario: Reject payment with zero amount
    Given I have a payment amount of $0.00
    When I submit the payment
    Then the system should reject it with "Invalid amount" error

  Scenario: Reject payment with negative amount
    Given I have a payment amount of -$25.00
    When I submit the payment
    Then the system should reject it with "Invalid amount" error

  Scenario: Process payment with invalid coupon
    Given I have a valid payment amount of $75.00
    When I submit the payment with coupon "INVALID10"
    Then the final amount should be $75.00

  Scenario: Process payment with empty coupon
    Given I have a valid payment amount of $30.00
    When I submit the payment with empty coupon
    Then the final amount should be $30.00

  Scenario: Process payment with case-sensitive coupon validation
    Given I have a valid payment amount of $200.00
    When I submit the payment with coupon "save10"
    Then the final amount should be $200.00

  Scenario: Process minimum amount with discount
    Given I have a valid payment amount of $0.01
    When I submit the payment with coupon "SAVE10"
    Then the final amount should be $0.009

=== AUTOMATED TEST SCRIPT ===

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

public class PaymentServiceTest {
    
    private PaymentService paymentService;
    
    @BeforeEach
    public void setUp() {
        paymentService = new PaymentService();
    }
    
    @Test
    @DisplayName("TC-001: Valid payment processing with positive amount and no discount coupon")
    public void testValidPaymentWithoutCoupon() {
        double amount = 50.0;
        double result = paymentService.processPayment(amount, null);
        assertEquals(50.0, result, 0.001, "Payment should return full amount without coupon");
    }
    
    @Test
    @DisplayName("TC-002: Valid payment processing with SAVE10 discount coupon applied")
    public void testValidPaymentWithSave10Coupon() {
        double amount = 100.0;
        double result = paymentService.processPayment(amount, "SAVE10");
        assertEquals(90.0, result, 0.001, "Payment should apply 10% discount with SAVE10 coupon");
    }
    
    @Test
    @DisplayName("TC-003: Payment processing rejects zero amount")
    public void testPaymentRejectsZeroAmount() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(0.0, null),
            "Zero amount should throw IllegalArgumentException"
        );
        assertEquals("Invalid amount", exception.getMessage());
    }
    
    @Test
    @DisplayName("TC-004: Payment processing rejects negative amount")
    public void testPaymentRejectsNegativeAmount() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(-25.0, null),
            "Negative amount should throw IllegalArgumentException"
        );
        assertEquals("Invalid amount", exception.getMessage());
    }
    
    @Test
    @DisplayName("TC-005: Payment processing with invalid coupon code")
    public void testPaymentWithInvalidCoupon() {
        double amount = 75.0;
        double result = paymentService.processPayment(amount, "INVALID10");
        assertEquals(75.0, result, 0.001, "Invalid coupon should not apply discount");
    }
    
    @Test
    @DisplayName("TC-006: Payment processing with empty coupon code")
    public void testPaymentWithEmptyCoupon() {
        double amount = 30.0;
        double result = paymentService.processPayment(amount, "");
        assertEquals(30.0, result, 0.001, "Empty coupon should not apply discount");
    }
    
    @Test
    @DisplayName("TC-007: Payment processing with case-sensitive coupon validation")
    public void testPaymentWithCaseSensitiveCoupon() {
        double amount = 200.0;
        double result = paymentService.processPayment(amount, "save10");
        assertEquals(200.0, result, 0.001, "Lowercase coupon should not apply discount due to case sensitivity");
    }
    
    @Test
    @DisplayName("TC-008: Payment processing with very small positive amount and discount")
    public void testPaymentWithMinimumAmountAndDiscount() {
        double amount = 0.01;
        double result = paymentService.processPayment(amount, "SAVE10");
        assertEquals(0.009, result, 0.0001, "Minimum amount should apply discount correctly");
    }
}

=== GITHUB ACTIONS WORKFLOW ===

name: Payment Service Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 11
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
        
    - name: Cache Maven dependencies
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2
        
    - name: Run tests
      run: mvn clean test
      
    - name: Generate test report
      run: mvn surefire-report:report
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: target/surefire-reports/
        
    - name: Publish test results
      uses: dorny/test-reporter@v1
      if: success() || failure()
      with:
        name: Maven Tests
        path: target/surefire-reports/*.xml
        reporter: java-junit