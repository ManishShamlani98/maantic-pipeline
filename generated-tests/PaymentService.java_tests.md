# AI Generated Tests — PaymentService.java

Mode: Generated from scratch
Language: Java

=== ANALYSIS ===
The PaymentService class processes payments with optional coupon discounts. It validates positive amounts and applies a 10% discount for "SAVE10" coupon. Test strategy covers positive/negative flows, edge cases for amount validation, coupon handling (valid/invalid/null), and boundary conditions.

=== BDD SCENARIOS (GHERKIN) ===
```gherkin
Feature: Payment Processing
  As a customer
  I want to process payments with optional coupons
  So that I can complete purchases with discounts

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
    Given I have a payment amount of 100.0
    When I process the payment with coupon "INVALID"
    Then the final amount should be 100.0

  @edge @regression
  Scenario: Process payment with null coupon
    Given I have a payment amount of 100.0
    When I process the payment with null coupon
    Then the final amount should be 100.0

  @edge @regression
  Scenario: Process payment with zero amount
    Given I have a payment amount of 0.0
    When I process the payment without a coupon
    Then an IllegalArgumentException should be thrown with message "Invalid amount"

  @edge @regression
  Scenario: Process payment with negative amount
    Given I have a payment amount of -50.0
    When I process the payment without a coupon
    Then an IllegalArgumentException should be thrown with message "Invalid amount"

  @regression
  Scenario Outline: Process payments with different amounts and coupons
    Given I have a payment amount of <amount>
    When I process the payment with coupon "<coupon>"
    Then the final amount should be <expected_amount>

    Examples:
      | amount | coupon   | expected_amount |
      | 50.0   | SAVE10   | 45.0           |
      | 200.0  | SAVE10   | 180.0          |
      | 75.5   | SAVE10   | 67.95          |
      | 100.0  | INVALID  | 100.0          |
      | 150.0  |          | 150.0          |
```

=== TDD TEST SCRIPT ===
```java
package com.example.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

public class PaymentServiceTest {
    
    private PaymentService paymentService;
    
    @BeforeEach
    void setUp() {
        paymentService = new PaymentService();
    }
    
    @Test
    @DisplayName("Should process payment without coupon and return original amount")
    void shouldProcessPaymentWithoutCoupon() {
        // Given
        double amount = 100.0;
        
        // When
        double result = paymentService.processPayment(amount, null);
        
        // Then
        assertEquals(100.0, result, 0.01);
    }
    
    @Test
    @DisplayName("Should apply 10% discount with SAVE10 coupon")
    void shouldApplyDiscountWithSave10Coupon() {
        // Given
        double amount = 100.0;
        String coupon = "SAVE10";
        
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(90.0, result, 0.01);
    }
    
    @Test
    @DisplayName("Should not apply discount with invalid coupon")
    void shouldNotApplyDiscountWithInvalidCoupon() {
        // Given
        double amount = 100.0;
        String coupon = "INVALID";
        
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(100.0, result, 0.01);
    }
    
    @Test
    @DisplayName("Should handle null coupon gracefully")
    void shouldHandleNullCoupon() {
        // Given
        double amount = 150.0;
        
        // When
        double result = paymentService.processPayment(amount, null);
        
        // Then
        assertEquals(150.0, result, 0.01);
    }
    
    @Test
    @DisplayName("Should handle empty string coupon")
    void shouldHandleEmptyStringCoupon() {
        // Given
        double amount = 200.0;
        String coupon = "";
        
        // When
        double result = paymentService.processPayment(amount, coupon);
        
        // Then
        assertEquals(200.0, result, 0.01);
    }
    
    @Test
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
    
    @ParameterizedTest
    @ValueSource(doubles = {-1.0, -50.0, -100.5, -0.01})
    @DisplayName("Should throw exception for negative amounts")
    void shouldThrowExceptionForNegativeAmounts(double amount) {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> paymentService.processPayment(amount, "SAVE10")
        );
        assertEquals("Invalid amount", exception.getMessage());
    }
    
    @ParameterizedTest
    @CsvSource({
        "50.0, SAVE10, 45.0",
        "200.0, SAVE10, 180.0",
        "75.5, SAVE10, 67.95",
        "100.0, INVALID, 100.0",
        "150.0, '', 150.0",
        "25.99, SAVE10, 23.391"
    })
    @DisplayName("Should process various payment amounts and coupons correctly")
    void shouldProcessVariousPaymentAmountsAndCoupons(double amount, String coupon, double expected) {
        // When
        double result = paymentService.processPayment(amount, coupon.isEmpty() ? null : coupon);
        
        // Then
        assertEquals(expected, result, 0.01);
    }
    
    @Test
    @DisplayName("Should handle very small positive amounts")
    void shouldHandleVerySmallPositiveAmounts() {
        // Given
        double amount = 0.01;
        
        // When
        double result = paymentService.processPayment(amount, "SAVE10");
        
        // Then
        assertEquals(0.009, result, 0.001);
    }
    
    @Test
    @DisplayName("Should handle large amounts")
    void shouldHandleLargeAmounts() {
        // Given
        double amount = 999999.99;
        
        // When
        double result = paymentService.processPayment(amount, "SAVE10");
        
        // Then
        assertEquals(899999.991, result, 0.01);
    }
    
    @Test
    @DisplayName("Should be case sensitive for coupon codes")
    void shouldBeCaseSensitiveForCouponCodes() {
        // Given
        double amount = 100.0;
        
        // When
        double resultLowerCase = paymentService.processPayment(amount, "save10");
        double resultMixedCase = paymentService.processPayment(amount, "Save10");
        
        // Then
        assertEquals(100.0, resultLowerCase, 0.01);
        assertEquals(100.0, resultMixedCase, 0.01);
    }
}
```

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
        
    - name: Create source directory
      run: mkdir -p src/main/java/com/example/payment
      
    - name: Create PaymentService.java
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
        
    - name: Create test directory
      run: mkdir -p src/test/java/com/example/payment
      
    - name: Create test file
      run: |
        cat > src/test/java/com/example/payment/PaymentServiceTest.java << 'EOF'
        package com.example.payment;
        
        import org.junit.jupiter.api.BeforeEach;
        import org.junit.jupiter.api.Test;
        import org.junit.jupiter.api.DisplayName;
        import org.junit.jupiter.params.ParameterizedTest;
        import org.junit.jupiter.params.provider.ValueSource;
        import org.junit.jupiter.params.provider.CsvSource;
        import static org.junit.jupiter.api.Assertions.*;
        
        public class PaymentServiceTest {
            
            private PaymentService paymentService;
            
            @BeforeEach
            void setUp() {
                paymentService = new PaymentService();
            }
            
            @Test
            @DisplayName("Should process payment without coupon and return original amount")
            void shouldProcessPaymentWithoutCoupon() {
                double amount = 100.0;
                double result = paymentService.processPayment(amount, null);
                assertEquals(100.0, result, 0.01);
            }
            
            @Test
            @DisplayName("Should apply 10% discount with SAVE10 coupon")
            void shouldApplyDiscountWithSave10Coupon() {
                double amount = 100.0;
                String coupon = "SAVE10";
                double result = paymentService.processPayment(amount, coupon);
                assertEquals(90.0, result, 0.01);
            }
            
            @Test
            @DisplayName("Should throw exception for zero amount")
            void shouldThrowExceptionForZeroAmount() {
                double amount = 0.0;
                IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> paymentService.processPayment(amount, null)
                );
                assertEquals("Invalid amount", exception.getMessage());
            }
            
            @ParameterizedTest
            @ValueSource(doubles = {-1.0, -50.0, -100.5})
            @DisplayName("Should throw exception for negative amounts")
            void shouldThrowExceptionForNegativeAmounts(double amount) {
                IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> paymentService.processPayment(amount, "SAVE10")
                );
                assertEquals("Invalid amount", exception.getMessage());
            }
            
            @ParameterizedTest
            @CsvSource({
                "50.0, SAVE10, 45.0",
                "200.0, SAVE10, 180.0",
                "100.0, INVALID, 100.0"
            })
            @DisplayName("Should process various payment amounts and coupons correctly")
            void shouldProcessVariousPaymentAmountsAndCoupons(double amount, String coupon, double expected) {
                double result = paymentService.processPayment(amount, coupon.equals("INVALID") ? coupon : coupon);
                assertEquals(expected, result, 0.01);
            }
        }
        EOF
        
    - name: Create pom.xml
      run: |
        cat > pom.xml << 'EOF'
        <?xml version="1.0" encoding="UTF-8"?>
        <project xmlns="http://maven.apache.org/POM/4.0.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
            <modelVersion>4.0.0</modelVersion>
            <groupId>com.example</groupId>
            <artifactId>payment-service</artifactId>
            <version>1.0.0</version>
            <packaging>jar</packaging>
            
            <properties>
                <maven.compiler.source>${{ matrix.java-version }}</maven.compiler.source>
                <maven.compiler.target>${{ matrix.java-version }}</maven.compiler.target>
                <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
                <junit.version>5.10.0</junit.version>
                <maven.surefire.version>3.1.2</maven.surefire.version>
            </properties>
            
            <dependencies>
                <dependency>
                    <groupId>org.junit.jupiter</groupId>
                    <artifactId>junit-jupiter</artifactId>
                    <version>${junit.version}</version>
                    <scope>test</scope>
                </dependency>
            </dependencies>
            
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-surefire-plugin</artifactId>
                        <version>${maven.surefire.version}</version>
                    </plugin>
                </plugins>
            </build>
        </project>
        EOF
        
    - name: Run tests
      run: mvn clean test
      
    - name: Generate test report
      run: mvn surefire-report:report
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results-java-${{ matrix.java-version }}
        path: target/surefire-reports/