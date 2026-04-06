# AI Generated Tests for PaymentService.java

Mode: Generated from scratch

# QA Analysis for PaymentService.java

## ANALYSIS
This code implements a simple payment processing service that validates payment amounts and applies discount coupons. It throws an exception for invalid amounts (≤0) and applies a 10% discount when the "SAVE10" coupon code is provided, otherwise returns the original amount.

## BDD SCENARIOS (GHERKIN)

```gherkin
Feature: Payment Processing Service
  As a customer
  I want to process payments with optional discount coupons
  So that I can complete purchases with applicable discounts

  @smoke @regression
  Scenario: Process payment with valid amount and no coupon
    Given I have a payment amount of 100.0
    When I process the payment without a coupon
    Then the final amount should be 100.0

  @smoke @regression
  Scenario: Process payment with valid SAVE10 coupon
    Given I have a payment amount of 100.0
    When I process the payment with coupon "SAVE10"
    Then the final amount should be 90.0

  @regression @edge
  Scenario: Process payment with invalid coupon code
    Given I have a payment amount of 100.0
    When I process the payment with coupon "INVALID"
    Then the final amount should be 100.0

  @regression @edge
  Scenario: Process payment with zero amount throws exception
    Given I have a payment amount of 0.0
    When I process the payment without a coupon
    Then an IllegalArgumentException should be thrown with message "Invalid amount"

  @regression @edge
  Scenario Outline: Process payments with various amounts and coupon combinations
    Given I have a payment amount of <amount>
    When I process the payment with coupon "<coupon>"
    Then the final amount should be <expectedAmount>

    Examples:
      | amount | coupon  | expectedAmount |
      | 50.0   | SAVE10  | 45.0          |
      | 200.0  | SAVE10  | 180.0         |
      | 75.5   | null    | 75.5          |
      | 99.99  | INVALID | 99.99         |
```

## TDD TEST SCRIPT

```java
package com.example.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
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
    @DisplayName("Should process payment with valid amount and no coupon")
    void shouldProcessPaymentWithValidAmountAndNoCoupon() {
        // Given
        double amount = 100.0;
        
        // When
        double result = paymentService.processPayment(amount, null);
        
        // Then
        assertEquals(100.0, result, 0.001);
    }

    @Test
    @DisplayName("Should apply 10% discount with SAVE10 coupon")
    void shouldApplyTenPercentDiscountWithSave10Coupon() {
        // Given
        double amount = 100.0;
        String coupon = "SAVE10";
        
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(90.0, result, 0.001);
    }

    @Test
    @DisplayName("Should not apply discount with invalid coupon")
    void shouldNotApplyDiscountWithInvalidCoupon() {
        // Given
        double amount = 100.0;
        String invalidCoupon = "INVALID";
        
        // When
        double result = paymentService.processPayment(amount, invalidCoupon);
        
        // Then
        assertEquals(100.0, result, 0.001);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for zero amount")
    void shouldThrowExceptionForZeroAmount() {
        // Given
        double zeroAmount = 0.0;
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(zeroAmount, null)
        );
        
        assertEquals("Invalid amount", exception.getMessage());
    }

    @ParameterizedTest
    @DisplayName("Should throw IllegalArgumentException for negative amounts")
    @ValueSource(doubles = {-1.0, -50.0, -0.01, -999.99})
    void shouldThrowExceptionForNegativeAmounts(double negativeAmount) {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(negativeAmount, null)
        );
        
        assertEquals("Invalid amount", exception.getMessage());
    }

    @ParameterizedTest
    @DisplayName("Should process various payment amounts and coupon combinations")
    @CsvSource({
        "50.0, SAVE10, 45.0",
        "200.0, SAVE10, 180.0",
        "75.5, , 75.5",
        "99.99, INVALID, 99.99",
        "1.0, SAVE10, 0.9",
        "0.01, SAVE10, 0.009"
    })
    void shouldProcessVariousPaymentAmountsAndCoupons(double amount, String coupon, double expectedAmount) {
        // Given
        String actualCoupon = coupon != null && !coupon.isEmpty() ? coupon : null;
        
        // When
        double result = paymentService.processPayment(amount, actualCoupon);
        
        // Then
        assertEquals(expectedAmount, result, 0.001);
    }

    @Test
    @DisplayName("Should handle empty string coupon as no coupon")
    void shouldHandleEmptyStringCouponAsNoCoupon() {
        // Given
        double amount = 100.0;
        String emptyCoupon = "";
        
        // When
        double result = paymentService.processPayment(amount, emptyCoupon);
        
        // Then
        assertEquals(100.0, result, 0.001);
    }

    @Test
    @DisplayName("Should be case sensitive for coupon codes")
    void shouldBeCaseSensitiveForCouponCodes() {
        // Given
        double amount = 100.0;
        String lowerCaseCoupon = "save10";
        
        // When
        double result = paymentService.processPayment(amount, lowerCaseCoupon);
        
        // Then
        assertEquals(100.0, result, 0.001, "Coupon should be case sensitive");
    }
}
```

## GITHUB ACTIONS WORKFLOW

```yaml
name: Payment Service CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        java-version: [11, 17, 21]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up JDK ${{ matrix.java-version }}
      uses: actions/setup-java@v4
      with:
        java-version: ${{ matrix.java-version }}
        distribution: 'temurin'
        
    - name: Cache Maven dependencies
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2
        
    - name: Create project structure
      run: |
        mkdir -p src/main/java/com/example/payment
        mkdir -p src/test/java/com/example/payment
        
    - name: Create PaymentService source file
      run: |
        cat > src/main/java/com/example/payment/PaymentService.java << 'EOF'
        package com.example.payment;
        
        public class PaymentService {
            public double processPayment(double amount, String coupon) {
                if (amount <= 0) throw new IllegalArgumentException("Invalid amount");
                if (coupon != null && coupon.equals("SAVE10")) {
                    return amount * 0.9;
                }
                return amount;
            }
        }
        EOF
        
    - name: Create test file
      run: |
        cp src/test/java/com/example/payment/PaymentServiceTest.java src/test/java/com/example/payment/PaymentServiceTest.java || cat > src/test/java/com/example/payment/PaymentServiceTest.java << 'EOF'
        package com.example.payment;

        import org.junit.jupiter.api.BeforeEach;
        import org.junit.jupiter.api.Test;
        import org.junit.jupiter.api.DisplayName;
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
            @DisplayName("Should process payment with valid amount and no coupon")
            void shouldProcessPaymentWithValidAmountAndNoCoupon() {
                double amount = 100.0;
                double result = paymentService.processPayment(amount, null);
                assertEquals(100.0, result, 0.001);
            }

            @Test
            @DisplayName("Should apply 10% discount with SAVE10 coupon")
            void shouldApplyTenPercentDiscountWithSave10Coupon() {
                double amount = 100.0;
                String coupon = "SAVE10";
                double result = paymentService.processPayment(amount, coupon);
                assertEquals(90.0, result, 0.001);
            }

            @Test
            @DisplayName("Should throw IllegalArgumentException for zero amount")
            void shouldThrowExceptionForZeroAmount() {
                double zeroAmount = 0.0;
                IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> paymentService.processPayment(zeroAmount, null)
                );
                assertEquals("Invalid amount", exception.getMessage());
            }
        }
        EOF
        
    - name: Create pom.xml
      run: |
        cat > pom.xml << 'EOF'
        <?xml version="1.0" encoding="UTF-8"?>
        <project xmlns="http://maven.apache.org/POM/4.0.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                 http://maven.apache.org/xsd/maven-4.0.0.xsd">
            <modelVersion>4.0.0</modelVersion>
            
            <groupId>com.example</groupId>
            <artifactId>payment-service</artifactId>
            <version>1.0.0</version>
            <packaging>jar</packaging>
            
            <properties>
                <maven.compiler.source>11</maven.compiler.source>
                <maven.compiler.target>11</maven.compiler.target>
                <junit.version>5.10.0</junit.version>
            </properties>