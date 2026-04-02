# AI Generated Tests for LibrarySystem/src/main/java/com/example/library/Library.java

Mode: TDD enhanced + BDD generated

Looking at the provided Java code and partial TDD tests, I'll analyze and enhance the testing approach.

=== ANALYSIS ===
**What changed or can be improved:**
1. The existing TDD tests are incomplete (contain TODOs and are cut off)
2. Missing edge cases: null inputs, empty strings, concurrent operations
3. Need to verify state changes after operations (book counts, checkout status)
4. Missing comprehensive integration scenarios
5. Exception message validation is absent
6. Need to test case-insensitive author search thoroughly
7. Missing tests for returning books that were never checked out
8. Need to validate member information in checkout/return operations

=== BDD SCENARIOS (GHERKIN) ===

```gherkin
Feature: Library Management System
  As a librarian
  I want to manage books and member checkouts
  So that I can track library inventory and loans

  Background:
    Given the library system is initialized
    And the following books exist in the library:
      | isbn              | title                  | author     | year |
      | 978-0-06-112008-4 | To Kill a Mockingbird | Harper Lee | 1960 |
      | 978-0-618-00222-3 | The Lord of the Rings | Tolkien    | 2001 |

  Scenario: Adding a new book successfully
    When I add a book with ISBN "978-0-452-28423-4", title "1984", author "George Orwell", year 1949
    Then the book should be added to the library
    And the total number of books should be 3

  Scenario: Preventing duplicate book addition
    When I attempt to add a book with existing ISBN "978-0-06-112008-4"
    Then a DuplicateBookException should be thrown
    And the error message should contain "ISBN already exists"

  Scenario: Finding books by author (case-insensitive)
    When I search for books by author "HARPER LEE"
    Then I should find 1 book
    And the book should be "To Kill a Mockingbird"

  Scenario: Checking out an available book
    Given the book "978-0-06-112008-4" is available
    When member "John Doe" checks out the book "978-0-06-112008-4"
    Then the book should be marked as checked out
    And the book should not be available

  Scenario: Returning a checked-out book
    Given member "John Doe" has checked out book "978-0-06-112008-4"
    When the book "978-0-06-112008-4" is returned
    Then the book should be available again

  Scenario: Removing a book from the library
    When I remove the book with ISBN "978-0-06-112008-4"
    Then the book should no longer exist in the library
    And the total number of books should be 1
```

=== ENHANCED TDD TEST SCRIPT ===

```java
package com.example.library;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Enhanced LibraryTest — Complete JUnit 5 TDD test suite.
 */
class LibraryTest {

    private Library lib;
    private Book book1, book2, book3;

    @BeforeEach
    void setUp() throws Exception {
        lib = new Library();
        book1 = new Book("978-0-06-112008-4", "To Kill a Mockingbird", "Harper Lee", 1960);
        book2 = new Book("978-0-618-00222-3", "The Lord of the Rings", "J.R.R. Tolkien", 2001);
        book3 = new Book("978-0-452-28423-4", "1984", "George Orwell", 1949);
        lib.addBook(book1);
        lib.addBook(book2);
    }

    @Nested
    @DisplayName("addBook() operations")
    class AddBookTests {
        
        @Test
        @DisplayName("should add new book successfully")
        void addNewBook() throws Exception {
            assertDoesNotThrow(() -> lib.addBook(book3));
            assertTrue(lib.isAvailable("978-0-452-28423-4"));
        }

        @Test
        @DisplayName("should throw DuplicateBookException for duplicate ISBN")
        void duplicateIsbn() {
            Library.DuplicateBookException exception = assertThrows(
                Library.DuplicateBookException.class, 
                () -> lib.addBook(book1)
            );
            assertTrue(exception.getMessage().contains("ISBN already exists"));
            assertTrue(exception.getMessage().contains("978-0-06-112008-4"));
        }

        @Test
        @DisplayName("should handle books with same title but different ISBN")
        void sameTitleDifferentIsbn() throws Exception {
            Book duplicateTitle = new Book("978-0-123-45678-9", "To Kill a Mockingbird", "Another Author", 2020);
            assertDoesNotThrow(() -> lib.addBook(duplicateTitle));
            assertTrue(lib.isAvailable("978-0-123-45678-9"));
        }
    }

    @Nested
    @DisplayName("removeBook() operations")
    class RemoveBookTests {

        @Test
        @DisplayName("should remove existing book successfully")
        void removeExistingBook() throws Exception {
            assertTrue(lib.isAvailable("978-0-06-112008-4"));
            assertDoesNotThrow(() -> lib.removeBook("978-0-06-112008-4"));
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
        }

        @Test
        @DisplayName("should throw BookNotFoundException for non-existent book")
        void removeNonExistentBook() {
            Library.BookNotFoundException exception = assertThrows(
                Library.BookNotFoundException.class,
                () -> lib.removeBook("978-0-000-00000-0")
            );
            assertTrue(exception.getMessage().contains("Book not found"));
        }

        @Test
        @DisplayName("should remove checked-out book and clear checkout record")
        void removeCheckedOutBook() throws Exception {
            lib.checkOut("978-0-06-112008-4", "John Doe");
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
            
            assertDoesNotThrow(() -> lib.removeBook("978-0-06-112008-4"));
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
        }
    }

    @Nested
    @DisplayName("findByAuthor() operations")
    class FindByAuthorTests {

        @Test
        @DisplayName("should find books by exact author name")
        void findByExactAuthor() throws Exception {
            lib.addBook(book3);
            List<Book> books = lib.findByAuthor("Harper Lee");
            assertEquals(1, books.size());
            assertEquals("To Kill a Mockingbird", books.get(0).title());
        }

        @Test
        @DisplayName("should find books case-insensitively")
        void findByAuthorCaseInsensitive() {
            List<Book> books = lib.findByAuthor("HARPER LEE");
            assertEquals(1, books.size());
            assertEquals("To Kill a Mockingbird", books.get(0).title());
            
            books = lib.findByAuthor("harper lee");
            assertEquals(1, books.size());
            assertEquals("To Kill a Mockingbird", books.get(0).title());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"", "   "})
        @DisplayName("should return empty list for null/empty author")
        void findByNullOrEmptyAuthor(String author) {
            List<Book> books = lib.findByAuthor(author);
            assertTrue(books.isEmpty());
        }

        @Test
        @DisplayName("should return empty list for non-existent author")
        void findByNonExistentAuthor() {
            List<Book> books = lib.findByAuthor("Non Existent Author");
            assertTrue(books.isEmpty());
        }

        @Test
        @DisplayName("should find multiple books by same author")
        void findMultipleBooksBySameAuthor() throws Exception {
            Book anotherTolkienBook = new Book("978-0-547-92822-7", "The Hobbit", "J.R.R. Tolkien", 1937);
            lib.addBook(anotherTolkienBook);
            
            List<Book> books = lib.findByAuthor("J.R.R. Tolkien");
            assertEquals(2, books.size());
            assertTrue(books.stream().allMatch(book -> "J.R.R. Tolkien".equals(book.author())));
        }
    }

    @Nested
    @DisplayName("checkOut() operations")
    class CheckOutTests {

        @Test
        @DisplayName("should check out available book successfully")
        void checkOutAvailableBook() throws Exception {
            assertTrue(lib.isAvailable("978-0-06-112008-4"));
            assertDoesNotThrow(() -> lib.checkOut("978-0-06-112008-4", "John Doe"));
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
        }

        @Test
        @DisplayName("should throw BookNotFoundException for non-existent book")
        void checkOutNonExistentBook() {
            Library.BookNotFoundException exception = assertThrows(
                Library.BookNotFoundException.class,
                () -> lib.checkOut("978-0-000-00000-0", "John Doe")
            );
            assertTrue(exception.getMessage().contains("Book not found"));
        }

        @Test
        @DisplayName("should throw BookUnavailableException for already checked-out book")
        void checkOutUnavailableBook() throws Exception {
            lib.checkOut("978-0-06-112008-4", "John Doe");
            
            Library.BookUnavailableException exception = assertThrows(
                Library.BookUnavailableException.class,
                () -> lib.checkOut("978-0-06-112008-4", "Jane Smith")
            );
            assertTrue(exception.getMessage().contains("Book is not available"));
        }

        @Test
        @DisplayName("should handle multiple checkouts by same member")
        void multipleCheckoutsBySameMember() throws Exception {
            assertDoesNotThrow(() -> lib.checkOut("978-0-06-112008-4", "John Doe"));
            assertDoesNotThrow(() -> lib.checkOut("978-0-618-00222-3", "John Doe"));
            
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
            assertFalse(lib.isAvailable("978-0-618-00222-3"));
        }
    }

    @Nested
    @DisplayName("returnBook() operations")
    class ReturnBookTests {

        @Test
        @DisplayName("should return checked-out book successfully")
        void returnCheckedOutBook() throws Exception {
            lib.checkOut("978-0-06-112008-4", "John Doe");
            assertFalse(lib.isAvailable("978-0-06-112008-4"));
            
            assertDoesNotThrow(() -> lib.returnBook("978-0-06-112008-4"));
            assertTrue(lib.isAvailable("978-0-06-112008-4"));
        }

        @Test
        @DisplayName("should throw BookNotFoundException for non-existent book")
        void returnNonExistentBook() {
            Library.BookNotFoundException exception = assertThrows(
                Library.BookNotFoundException.class,