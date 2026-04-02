# Tests for LibrarySystem/src/main/java/com/example/library/Library.java

# QA Analysis for Library Management System

## === BDD SCENARIOS (GHERKIN) ===

```gherkin
Feature: Library Management System
  As a librarian
  I want to manage books and member checkouts
  So that I can maintain an organized library system

  @smoke @regression
  Scenario: Successfully add and retrieve books
    Given I have an empty library
    When I add a book with ISBN "978-1234567890", title "Clean Code", and author "Robert Martin"
    Then the book should be available in the library
    And the book should be marked as available

  @smoke @regression
  Scenario: Check out and return books
    Given I have a library with a book ISBN "978-1234567890"
    When I check out the book to member "john.doe"
    Then the book should not be available
    When I return the book
    Then the book should be available again

  @regression
  Scenario: Find books by author case-insensitive search
    Given I have a library with books by "Robert Martin" and "Martin Fowler"
    When I search for books by author "martin"
    Then I should find 2 books
    When I search for books by author "ROBERT"
    Then I should find 1 book

  @edge @regression
  Scenario: Handle duplicate ISBN addition
    Given I have a library with a book ISBN "978-1234567890"
    When I try to add another book with the same ISBN "978-1234567890"
    Then I should receive a duplicate book exception
    And the original book should remain in the library

  @edge @regression
  Scenario: Handle operations on non-existent books
    Given I have an empty library
    When I try to check out book with ISBN "non-existent"
    Then I should receive a book not found exception
    When I try to return book with ISBN "non-existent"
    Then I should receive a book not found exception
    When I try to remove book with ISBN "non-existent"
    Then I should receive a book not found exception
```

## === TDD TEST SCRIPT ===

```java
package com.example.library;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Library Management System Tests")
class LibraryTest {

    private Library library;
    private Book testBook1;
    private Book testBook2;
    private Book testBook3;

    @BeforeEach
    void setUp() {
        library = new Library();
        testBook1 = new Book("978-1234567890", "Clean Code", "Robert Martin");
        testBook2 = new Book("978-0987654321", "Refactoring", "Martin Fowler");
        testBook3 = new Book("978-1111111111", "Design Patterns", "Gang of Four");
    }

    @Nested
    @DisplayName("Book Addition Tests")
    class BookAdditionTests {

        @Test
        @DisplayName("Should successfully add a new book")
        void shouldAddNewBook() throws Library.DuplicateBookException {
            // When
            library.addBook(testBook1);

            // Then
            assertTrue(library.isAvailable(testBook1.isbn()));
        }

        @Test
        @DisplayName("Should throw exception when adding duplicate ISBN")
        void shouldThrowExceptionForDuplicateISBN() throws Library.DuplicateBookException {
            // Given
            library.addBook(testBook1);

            // When & Then
            Library.DuplicateBookException exception = assertThrows(
                Library.DuplicateBookException.class,
                () -> library.addBook(new Book(testBook1.isbn(), "Different Title", "Different Author"))
            );
            assertTrue(exception.getMessage().contains(testBook1.isbn()));
        }
    }

    @Nested
    @DisplayName("Book Removal Tests")
    class BookRemovalTests {

        @Test
        @DisplayName("Should successfully remove existing book")
        void shouldRemoveExistingBook() throws Library.DuplicateBookException, Library.BookNotFoundException {
            // Given
            library.addBook(testBook1);
            assertTrue(library.isAvailable(testBook1.isbn()));

            // When
            library.removeBook(testBook1.isbn());

            // Then
            assertFalse(library.isAvailable(testBook1.isbn()));
        }

        @Test
        @DisplayName("Should throw exception when removing non-existent book")
        void shouldThrowExceptionForNonExistentBook() {
            // When & Then
            Library.BookNotFoundException exception = assertThrows(
                Library.BookNotFoundException.class,
                () -> library.removeBook("non-existent-isbn")
            );
            assertTrue(exception.getMessage().contains("Book not found"));
        }

        @Test
        @DisplayName("Should remove checked out book successfully")
        void shouldRemoveCheckedOutBook() throws Exception {
            // Given
            library.addBook(testBook1);
            library.checkOut(testBook1.isbn(), "member1");

            // When
            library.removeBook(testBook1.isbn());

            // Then
            assertFalse(library.isAvailable(testBook1.isbn()));
        }
    }

    @Nested
    @DisplayName("Author Search Tests")
    class AuthorSearchTests {

        @BeforeEach
        void setUpBooks() throws Library.DuplicateBookException {
            library.addBook(testBook1); // Robert Martin
            library.addBook(testBook2); // Martin Fowler
            library.addBook(testBook3); // Gang of Four
        }

        @Test
        @DisplayName("Should find books by exact author name")
        void shouldFindBooksByExactAuthor() {
            // When
            List<Book> books = library.findByAuthor("Robert Martin");

            // Then
            assertEquals(1, books.size());
            assertEquals(testBook1.isbn(), books.get(0).isbn());
        }

        @ParameterizedTest
        @ValueSource(strings = {"martin", "MARTIN", "Martin", "MaRtIn"})
        @DisplayName("Should find books by author case-insensitive")
        void shouldFindBooksCaseInsensitive(String searchTerm) {
            // When
            List<Book> books = library.findByAuthor(searchTerm);

            // Then
            assertEquals(2, books.size());
        }

        @Test
        @DisplayName("Should return empty list for null author")
        void shouldReturnEmptyListForNullAuthor() {
            // When
            List<Book> books = library.findByAuthor(null);

            // Then
            assertTrue(books.isEmpty());
        }

        @Test
        @DisplayName("Should return empty list for non-existent author")
        void shouldReturnEmptyListForNonExistentAuthor() {
            // When
            List<Book> books = library.findByAuthor("Non Existent Author");

            // Then
            assertTrue(books.isEmpty());
        }
    }

    @Nested
    @DisplayName("Check Out Tests")
    class CheckOutTests {

        @BeforeEach
        void setUpBook() throws Library.DuplicateBookException {
            library.addBook(testBook1);
        }

        @Test
        @DisplayName("Should successfully check out available book")
        void shouldCheckOutAvailableBook() throws Exception {
            // When
            library.checkOut(testBook1.isbn(), "member1");

            // Then
            assertFalse(library.isAvailable(testBook1.isbn()));
        }

        @Test
        @DisplayName("Should throw exception for non-existent book checkout")
        void shouldThrowExceptionForNonExistentBookCheckout() {
            // When & Then
            assertThrows(
                Library.BookNotFoundException.class,
                