# Tests for LibrarySystem/src/main/java/com/example/library/Book.java

# QA Analysis for Book.java

## BDD SCENARIOS (GHERKIN)

```gherkin
Feature: Book Creation and Validation
  As a library system user
  I want to create book records with valid information
  So that the library catalog maintains data integrity

  @smoke @regression
  Scenario: Create a valid book successfully
    Given I have valid book information
    When I create a book with ISBN "978-0134685991", title "Effective Java", author "Joshua Bloch", and year 2018
    Then the book should be created successfully
    And the book should have ISBN "978-0134685991"
    And the book should have title "Effective Java"
    And the book should have author "Joshua Bloch"
    And the book should have year 2018

  @smoke @regression
  Scenario Outline: Reject book creation with invalid ISBN
    Given I want to create a book
    When I attempt to create a book with ISBN "<isbn>", title "Valid Title", author "Valid Author", and year 2020
    Then an IllegalArgumentException should be thrown
    And the error message should contain "ISBN must not be blank"

    Examples:
      | isbn |
      | null |
      | ""   |
      | "   "|

  @regression @edge
  Scenario Outline: Reject book creation with invalid title
    Given I want to create a book
    When I attempt to create a book with ISBN "978-0134685991", title "<title>", author "Valid Author", and year 2020
    Then an IllegalArgumentException should be thrown
    And the error message should contain "Title must not be blank"

    Examples:
      | title |
      | null  |
      | ""    |
      | "   " |

  @regression @edge
  Scenario Outline: Reject book creation with invalid author
    Given I want to create a book
    When I attempt to create a book with ISBN "978-0134685991", title "Valid Title", author "<author>", and year 2020
    Then an IllegalArgumentException should be thrown
    And the error message should contain "Author must not be blank"

    Examples:
      | author |
      | null   |
      | ""     |
      | "   "  |

  @regression @edge
  Scenario Outline: Reject book creation with invalid year
    Given I want to create a book
    When I attempt to create a book with ISBN "978-0134685991", title "Valid Title", author "Valid Author", and year <year>
    Then an IllegalArgumentException should be thrown
    And the error message should contain "Year must be 4-digit"

    Examples:
      | year |
      | 999  |
      | 10000|
      | 500  |
      | 2024000|
```

## TDD TEST SCRIPT

```java
package com.example.library;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Book Tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class BookTest {

    @Nested
    @DisplayName("Valid Book Creation")
    class ValidBookCreation {

        @Test
        @DisplayName("Should create book with valid parameters")
        void shouldCreateBookWithValidParameters() {
            // Given
            String isbn = "978-0134685991";
            String title = "Effective Java";
            String author = "Joshua Bloch";
            int year = 2018;

            // When
            Book book = new Book(isbn, title, author, year);

            // Then
            assertNotNull(book);
            assertEquals(isbn, book.isbn());
            assertEquals(title, book.title());
            assertEquals(author, book.author());
            assertEquals(year, book.year());
        }

        @Test
        @DisplayName("Should create book with minimum valid year")
        void shouldCreateBookWithMinimumValidYear() {
            // Given & When
            Book book = new Book("978-0134685991", "Ancient Text", "Ancient Author", 1000);

            // Then
            assertEquals(1000, book.year());
        }

        @Test
        @DisplayName("Should create book with maximum valid year")
        void shouldCreateBookWithMaximumValidYear() {
            // Given & When
            Book book = new Book("978-0134685991", "Future Text", "Future Author", 9999);

            // Then
            assertEquals(9999, book.year());
        }

        @Test
        @DisplayName("Should handle special characters in fields")
        void shouldHandleSpecialCharactersInFields() {
            // Given & When
            Book book = new Book("978-0-13-468599-1", "Effective Java: 3rd Edition", "Joshua M. Bloch", 2018);

            // Then
            assertNotNull(book);
            assertEquals("978-0-13-468599-1", book.isbn());
            assertEquals("Effective Java: 3rd Edition", book.title());
            assertEquals("Joshua M. Bloch", book.author());
        }
    }

    @Nested
    @DisplayName("ISBN Validation")
    class IsbnValidation {

        @Test
        @DisplayName("Should reject null ISBN")
        void shouldRejectNullIsbn() {
            // Given & When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new Book(null, "Valid Title", "Valid Author", 2020)
            );
            assertEquals("ISBN must not be blank", exception.getMessage());
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "   ", "\t", "\n", "  \t  "})
        @DisplayName("Should reject blank ISBN")
        void shouldRejectBlankIsbn(String isbn) {
            // Given & When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new Book(isbn, "Valid Title", "Valid Author", 2020)
            );
            assertEquals("ISBN must not be blank", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Title Validation")
    class TitleValidation {

        @Test
        @DisplayName("Should reject null title")
        void shouldRejectNullTitle() {
            // Given & When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new Book("978-0134685991", null, "Valid Author", 2020)
            );
            assertEquals("Title must not be blank", exception.getMessage());
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "   ", "\t", "\n", "  \t  "})
        @DisplayName("Should reject blank title")
        void shouldRejectBlankTitle(String title) {
            // Given & When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new Book("978-0134685991", title, "Valid Author", 2020)
            );
            assertEquals("Title must not be blank", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Author Validation")
    class AuthorValidation {

        @Test
        @DisplayName("Should reject null author")
        void shouldRejectNullAuthor() {
            // Given & When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new Book("978-0134685991", "Valid Title", null, 2020)
            );
            assertEquals("Author must not be blank", exception.getMessage());
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "   ", "\t", "\n", "  \t  "})
        @DisplayName("Should reject blank author")
        void should