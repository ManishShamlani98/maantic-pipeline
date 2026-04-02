# AI Generated Tests for LibrarySystem/src/main/java/com/example/library/Book.java

Mode: Generated from scratch

# QA Analysis for Book.java

## ANALYSIS
This code defines an immutable Book record with validation in the compact constructor. It validates that ISBN, title, and author are not null/blank, and year is a 4-digit number (1000-9999). The record automatically generates equals, hashCode, toString, and accessor methods.

## BDD SCENARIOS (GHERKIN)

```gherkin
Feature: Book Creation and Validation
  As a library system user
  I want to create valid book records
  So that I can maintain accurate book information

  @smoke @regression
  Scenario: Create a valid book with all required fields
    Given I have valid book details
    When I create a book with ISBN "978-0134685991", title "Effective Java", author "Joshua Bloch", and year 2017
    Then the book should be created successfully
    And the book should have ISBN "978-0134685991"
    And the book should have title "Effective Java"
    And the book should have author "Joshua Bloch"
    And the book should have year 2017

  @regression @edge
  Scenario: Attempt to create book with blank ISBN
    Given I have book details with blank ISBN
    When I try to create a book with ISBN "", title "Clean Code", author "Robert Martin", and year 2008
    Then an IllegalArgumentException should be thrown
    And the exception message should contain "ISBN must not be blank"

  @regression @edge
  Scenario: Attempt to create book with invalid year
    Given I have book details with invalid year
    When I try to create a book with ISBN "978-0132350884", title "Clean Code", author "Robert Martin", and year 999
    Then an IllegalArgumentException should be thrown
    And the exception message should contain "Year must be 4-digit"

  @smoke @regression
  Scenario: Verify book immutability and equality
    Given I create two books with identical details
    When I compare the books for equality
    Then the books should be equal
    And they should have the same hash code

  @regression @edge
  Scenario Outline: Validate book creation with various invalid inputs
    Given I have invalid book details
    When I try to create a book with ISBN "<isbn>", title "<title>", author "<author>", and year <year>
    Then an IllegalArgumentException should be thrown
    And the exception message should contain "<expectedMessage>"

    Examples:
      | isbn           | title       | author        | year | expectedMessage        |
      |                | Clean Code  | Robert Martin | 2008 | ISBN must not be blank |
      | 978-0132350884 |             | Robert Martin | 2008 | Title must not be blank|
      | 978-0132350884 | Clean Code  |               | 2008 | Author must not be blank|
      | 978-0132350884 | Clean Code  | Robert Martin | 10000| Year must be 4-digit   |
```

## TDD TEST SCRIPT

```java
package com.example.library;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Book Tests")
class BookTest {

    @Test
    @DisplayName("Should create valid book with all required fields")
    void shouldCreateValidBookWithAllRequiredFields() {
        // Given
        String isbn = "978-0134685991";
        String title = "Effective Java";
        String author = "Joshua Bloch";
        int year = 2017;

        // When
        Book book = new Book(isbn, title, author, year);

        // Then
        assertNotNull(book);
        assertEquals(isbn, book.isbn());
        assertEquals(title, book.title());
        assertEquals(author, book.author());
        assertEquals(year, book.year());
    }

    @ParameterizedTest
    @DisplayName("Should throw exception for null or blank ISBN")
    @ValueSource(strings = {"", " ", "   ", "\t", "\n"})
    void shouldThrowExceptionForInvalidIsbn(String invalidIsbn) {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book(invalidIsbn, "Clean Code", "Robert Martin", 2008)
        );
        assertEquals("ISBN must not be blank", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception for null ISBN")
    void shouldThrowExceptionForNullIsbn() {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book(null, "Clean Code", "Robert Martin", 2008)
        );
        assertEquals("ISBN must not be blank", exception.getMessage());
    }

    @ParameterizedTest
    @DisplayName("Should throw exception for null or blank title")
    @ValueSource(strings = {"", " ", "   ", "\t", "\n"})
    void shouldThrowExceptionForInvalidTitle(String invalidTitle) {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book("978-0132350884", invalidTitle, "Robert Martin", 2008)
        );
        assertEquals("Title must not be blank", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception for null title")
    void shouldThrowExceptionForNullTitle() {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book("978-0132350884", null, "Robert Martin", 2008)
        );
        assertEquals("Title must not be blank", exception.getMessage());
    }

    @ParameterizedTest
    @DisplayName("Should throw exception for null or blank author")
    @ValueSource(strings = {"", " ", "   ", "\t", "\n"})
    void shouldThrowExceptionForInvalidAuthor(String invalidAuthor) {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book("978-0132350884", "Clean Code", invalidAuthor, 2008)
        );
        assertEquals("Author must not be blank", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception for null author")
    void shouldThrowExceptionForNullAuthor() {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book("978-0132350884", "Clean Code", null, 2008)
        );
        assertEquals("Author must not be blank", exception.getMessage());
    }

    @ParameterizedTest
    @DisplayName("Should throw exception for invalid year")
    @ValueSource(ints = {999, 500, 0, -1, 10000, 2025, 99999})
    void shouldThrowExceptionForInvalidYear(int invalidYear) {
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book("978-0132350884", "Clean Code", "Robert Martin", invalidYear)
        );
        assertEquals("Year must be 4-digit", exception.getMessage());
    }

    @ParameterizedTest
    @DisplayName("Should accept valid 4-digit years")
    @ValueSource(ints = {1000, 1500, 1995, 2023, 9999})
    void shouldAcceptValid4DigitYears(int validYear) {
        // When & Then
        assertDoesNotThrow(() -> {
            Book book = new Book("978-0132350884", "Clean Code", "Robert Martin", validYear);
            assertEquals(validYear, book.year());
        });
    }

    @Test
    @DisplayName("Should implement equals and hashCode correctly")
    void shouldImplementEqualsAndHashCodeCorrectly() {
        // Given
        Book book1 = new Book("978-0134685991", "Effective Java", "Joshua Bloch", 2017);
        Book book2 = new Book("978-0134685991", "Effective Java", "Joshua Bloch", 2017);
        Book book3 = new Book("978-0132350884", "Clean Code", "Robert Martin", 2008);

        // Then
        assertEquals(book1, book2);
        assertEquals(book1.hashCode(), book2.hashCode());
        assertNotEquals(book1, book3);
        assertNotEquals(book1.hashCode(), book3.hashCode());
    }

    @Test
    @DisplayName("Should implement toString correctly")
    void shouldImplementToStringCorrectly() {
        // Given
        Book book = new Book("978-0134685991", "Effective Java", "Joshua Bloch", 2017);

        // When
        String toString = book.toString();

        // Then
        assertNotNull(toString);
        assertTrue(toString.contains("978-0134685991"));
        assertTrue(toString.contains("Effective Java"));
        assertTrue(toString.contains("Joshua Bloch"));
        assertTrue(toString.contains("2017"));
    }

    @ParameterizedTest
    @DisplayName("Should validate all combinations of invalid parameters")
    @CsvSource({
        "'', 'Title', 'Author', 2000, 'ISBN must not be blank'",
        "'123', '', 'Author', 2000, 'Title must not be blank'",
        "'123', 'Title', '', 2000, 'Author must not be blank'",
        "'123', 'Title', 'Author', 999, 'Year must be 4-digit'",
        "'123', 'Title', 'Author', 10000, 'Year must be 4-digit'"
    })
    void shouldValidateAllCombinationsOfInvalidParameters(
            String isbn, String title, String author, int year, String expectedMessage) {
        
        // Handle empty strings as null for proper validation
        String actualIsbn = isbn.isEmpty() ? null : isbn;
        String actualTitle = title.isEmpty() ? null : title;
        String actualAuthor = author.isEmpty() ? null : author;

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> new Book(actualIsbn, actualTitle, actualAuthor, year)
        );
        assertEquals(expectedMessage, exception.getMessage());
    }
}
```

## GITHUB ACTIONS WORKFLOW

```yaml
name: Library System CI/CD

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
      uses: actions/cache@v4
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2

    - name: Create Maven wrapper if not exists
      run: |
        if [ ! -f mvnw ]; then
          mvn wrapper:wrapper
        fi

    - name: Make Maven wrapper executable
      run: chmod +x mvnw

    - name: Compile code
      run: ./mvnw compile

    - name: Run smoke tests
      run: ./mvnw test -Dgroups="smoke"

    - name: Run all tests
      run: ./mvnw test

    - name: Generate test report
      run: ./mvnw surefire-report:report

    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: always()
      with: